"""Unretouched round1 cameraC evidence and controlled4A camera-study comparison."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json
root=Path(__file__).resolve().parents[1];out=root/'docs/qa/overhaul-v1/iteration-4b/round-1';before=root/'docs/qa/overhaul-v1/iteration-4b/camera-study';thumb=out/'thumbnails';detail=out/'details'
thumb.mkdir(exist_ok=True);detail.mkdir(exist_ok=True)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
records=[]
sources={'target':root/'docs/references/target-red-corridor.jpg','production-C':out/'production-C.png','neutral-C':out/'neutral-C.png','before-production-C':before/'production-C.png','before-neutral-C':before/'neutral-C.png'}
for mode in ['production','neutral']:
 for key in 'AB':
  p=out/f'{mode}-{key}.png'
  if p.exists():sources[f'{mode}-{key}']=p
for name,path in sources.items():
 im=Image.open(path).convert('RGB');im.resize((320,180),Image.Resampling.LANCZOS).save(thumb/f'{name}.png');records.append({'source':str(path.relative_to(root)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'output':f'thumbnails/{name}.png','method':'Lanczos320x180 only; no retouching'})
sheet=Image.new('RGB',(1000,220),(18,21,26));draw=ImageDraw.Draw(sheet)
for x,name,label in [(10,'target','TARGET'),(340,'production-C','C'),(670,'neutral-C','C / NEUTRAL')]:draw.text((x,8),label,fill=(235,235,240),font=font);sheet.paste(Image.open(thumb/f'{name}.png'),(x,32))
sheet.save(out/'review-contact-sheet.png')
# Same exact fixed pixel regions in baseline and current C.
regions={'near':[1120,120,1920,1080],'middle':[260,180,1220,960],'far':[450,330,950,760]}
for name in ['production-C','neutral-C','before-production-C','before-neutral-C']:
 im=Image.open(sources[name]).convert('RGB')
 for key,box in regions.items():
  target=detail/f'{name}-{key}.png';im.crop(box).save(target);records.append({'source':str(sources[name].relative_to(root)),'output':str(target.relative_to(out)),'bounds':box,'method':'Exact unscaled source pixels'})
for mode in ['production','neutral']:
 a=Image.open(sources[f'before-{mode}-C']).convert('RGB');b=Image.open(sources[f'{mode}-C']).convert('RGB');im=Image.new('RGB',(3840,1080));im.paste(a,(0,0));im.paste(b,(1920,0));im.save(out/f'comparison-cameraStudyC-{mode}.png')
a=Image.open(sources['target']).convert('RGB').resize((1920,1080),Image.Resampling.LANCZOS);b=Image.open(sources['production-C']).convert('RGB');im=Image.new('RGB',(3840,1080));im.paste(a,(0,0));im.paste(b,(1920,0));im.save(out/'comparison-reference.png')
(out/'image-provenance.json').write_text(json.dumps({'records':records,'regions':regions,'comparisonLayout':'baseline/target left; current right; concatenation only, target Lanczos resampled to1920x1080','sceneImageColorAdjustments':False},indent=2)+'\n')
print('Saved label-only review sheet,320px thumbnails, unscaled crops, controlled comparisons')
