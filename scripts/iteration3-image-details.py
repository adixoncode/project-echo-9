"""Exact pixel crops for Issue #3 evidence; no resizing, grading or image synthesis."""
from pathlib import Path
from PIL import Image
import hashlib,json

root=Path(__file__).resolve().parents[1]
out=root/'docs/qa/overhaul-v1/iteration-3'
dest=out/'details';dest.mkdir(exist_ok=True)
regions={'red-edge':[160,420,420,640], 'wall':[800,240,1000,660],
         'pipes':[730,700,1100,1030], 'grate':[80,790,650,1040]}
stages=[('iteration2','before-clean.png','baseline-capture.json'),
        ('p0','checkpoints/p0-clean.png','checkpoints/p0-capture.json'),
        ('materials','checkpoints/materials-clean.png','checkpoints/materials-capture.json'),
        ('final','after-clean.png','after-capture.json')]
records=[]
for tag,path,metadata in stages:
    source=out/path;meta=out/metadata
    if not source.exists() or not meta.exists():continue
    capture=json.loads(meta.read_text())
    with Image.open(source) as im:
        assert im.size==(1920,1080),f'Unexpected capture size: {source}'
        for name,bounds in regions.items():
            target=dest/f'{tag}-{name}.png';im.crop(bounds).save(target)
            records.append({'stage':tag,'region':name,'source':path,'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
                            'artifactSha256':capture['artifactSha256'],'metadata':metadata,'bounds':bounds,
                            'output':str(target.relative_to(out)),'outputSha256':hashlib.sha256(target.read_bytes()).hexdigest()})
(dest/'crop-provenance.json').write_text(json.dumps({'method':'Original pixel extraction only; zero resampling/color adjustment. Material comparisons use controlled p0 vs materials lighting, final vs iteration2 includes relighting.','regions':regions,'crops':records},indent=2)+'\n')
print(f'Saved {len(records)} exact crops')
