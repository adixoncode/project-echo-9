"""Faithful evidence crops and320px thumbnails, never scene-image retouching."""
from pathlib import Path
from PIL import Image
import hashlib,json
root=Path(__file__).resolve().parents[1]
out=root/'docs/qa/overhaul-v1/iteration-4a'
thumb=out/'thumbnails';detail=out/'details';thumb.mkdir(exist_ok=True);detail.mkdir(exist_ok=True)
sources={'reference':root/'docs/references/target-red-corridor.jpg','iteration3':out/'before-clean.png','neutral':out/'neutral-clean.png','production':out/'after-clean.png'}
records=[]
for name,path in sources.items():
 image=Image.open(path).convert('RGB');target=thumb/(name+'.png')
 image.resize((320,180),Image.Resampling.LANCZOS).save(target)
 records.append({'source':str(path.relative_to(root)),'sourceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'output':str(target.relative_to(out)),'method':'320x180 Lanczos resampling only; no sharpening, grading or retouching'})
regions={'near':[730,80,1330,880],'middle':[200,250,850,800],'far':[430,390,760,650]}
for name in ['iteration3','neutral','production']:
 path=sources[name];image=Image.open(path).convert('RGB')
 assert image.size==(1920,1080)
 for region,bounds in regions.items():
  target=detail/f'{name}-{region}.png';image.crop(bounds).save(target)
  records.append({'source':str(path.relative_to(root)),'sourceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'output':str(target.relative_to(out)),'bounds':bounds,'method':'Exact original pixel extraction; zero resizing/color adjustment'})
(out/'image-detail-provenance.json').write_text(json.dumps({'regions':regions,'records':records},indent=2)+'\n')
print('Saved4thumbnails and9raw near/middle/far crops with provenance.')
