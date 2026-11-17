"""Compare actual clean captures; pixel differences require scope review, never automatic art acceptance."""
from pathlib import Path
import json
import hashlib
import numpy as np
from PIL import Image
root = Path(__file__).resolve().parents[1]
out = root / 'docs/qa/overhaul-v1/iteration-1'
checks = []
for view in [1, 2, 3, 5, 6]:
    before_path, after_path = out / f'before-view-{view}.png', out / f'after-view-{view}.png'
    before = np.array(Image.open(before_path).convert('RGB'), dtype=np.int16)
    after = np.array(Image.open(after_path).convert('RGB'), dtype=np.int16)
    if before.shape != after.shape:
        checks.append({'view': view, 'status': 'FAIL', 'reason': 'Capture dimensions changed'})
        continue
    delta = np.abs(after-before)
    changed = np.any(delta != 0, axis=2)
    y, x = np.where(changed)
    checks.append({'view': view, 'status': 'PASS' if not changed.any() else 'BLOCKED',
                   'reason': 'Pixel-identical outside corridor view' if not changed.any() else 'Differences need manual classification against visible corridor geometry',
                   'changedPixels': int(changed.sum()), 'changedFraction': float(changed.mean()),
                   'meanAbsoluteRgbDifference': float(delta.mean()), 'maxChannelDifference': int(delta.max()),
                   'changedBoundingBox': [int(x.min()), int(y.min()), int(x.max()+1), int(y.max()+1)] if changed.any() else None,
                   'beforeSha256': hashlib.sha256(before_path.read_bytes()).hexdigest(),
                   'afterSha256': hashlib.sha256(after_path.read_bytes()).hexdigest()})
scope_file=out/'sector-scope-review.json'
if scope_file.exists():
    scope=json.loads(scope_file.read_text())
    current_sha=hashlib.sha256((root/'index.html').read_bytes()).hexdigest()
    if scope.get('artifactSha256')==current_sha:
        for check in checks:
            for review in scope.get('reviews',[]):
                if all(check.get(k)==review.get(k) for k in ['view','beforeSha256','afterSha256']):
                    check['automatedStatus']=check['status']
                    check['status']=review['status']
                    check['scopeReview']=review['reason']
report = {'method': 'Exact RGB pixel comparison at fixed camera, seed, time12, High1920×1080; no normalization or retouching',
          'checks': checks}
(out / 'sector-image-regressions.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))
# Descriptive image measurements, never a proxy for artistic acceptance.
measurements = {}
for name, path in [('reference', root/'docs/references/target-red-corridor.jpg'),
                   ('before', out/'before-clean.png'), ('after', out/'after-clean.png')]:
    rgb = np.asarray(Image.open(path).convert('RGB'), dtype=np.float64)/255
    luminance = rgb @ np.array([.2126, .7152, .0722])
    measurements[name] = {'meanDisplayLuminance':float(luminance.mean()),
                          'medianDisplayLuminance':float(np.median(luminance)),
                          'darkPixelFractionBelow24of255':float((luminance<24/255).mean()),
                          'highlightFractionAbove220of255':float((luminance>220/255).mean())}
base = np.asarray(Image.open(out/'after-clean.png').convert('RGB'), dtype=np.int16)
ablations = []
for name in ['no-shadows','no-environment']:
    path=out/(name+'.png')
    if not path.exists():
        continue
    image=np.asarray(Image.open(path).convert('RGB'),dtype=np.int16)
    delta=np.abs(base-image);changed=np.any(delta>0,axis=2)
    ablations.append({'name':name,'changedPixelFraction':float(changed.mean()),
                      'meanAbsoluteRgbDifference':float(delta.mean()),'maxChannelDifference':int(delta.max()),
                      'status':'PASS' if changed.any() else 'FAIL',
                      'meaning':'Feature contributes actual pixels; this is not an art-direction score'})
(out/'image-measurements.json').write_text(json.dumps({'method':'Unnormalized encoded-sRGB luminance statistics; different compositions, diagnostic only',
                                                      'measurements':measurements,'ablations':ablations},indent=2)+'\n')
print(json.dumps({'measurements':measurements,'ablations':ablations},indent=2))
