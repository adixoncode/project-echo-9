"""Round2 faithful evidence: geometry-controlled originalC and evolvedshotC2."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json
root=Path(__file__).resolve().parents[1];out=root/'docs/qa/overhaul-v1/iteration-4b/round-2';before=root/'docs/qa/overhaul-v1/iteration-4b/round-1';thumb=out/'thumbnails';detail=out/'details';thumb.mkdir(exist_ok=True);detail.mkdir(exist_ok=True)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
sources={'target':root/'docs/references/target-red-corridor.jpg','production-C2':out/'production-C2.png','neutral-C2':out/'neutral-C2.png','production-C':out/'production-C.png','before-production-C':before/'production-C.png','before-neutral-C':before/'neutral-C.png'}
if (out/'neutral-C.png').exists():sources['neutral-C']=out/'neutral-C.png'
records=[]
for name,path in sources.items():
 im=Image.open(path).convert('RGB');im.resize((320,180),Image.Resampling.LANCZOS).save(thumb/f'{name}.png');records.append({'source':str(path.relative_to(root)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'output':f'thumbnails/{name}.png','method':'Lanczos320x180 only; no retouching'})
sheet=Image.new('RGB',(1000,220),(18,21,26));draw=ImageDraw.Draw(sheet)
for x,name,label in [(10,'target','TARGET'),(340,'production-C2','C2'),(670,'neutral-C2','C2 / NEUTRAL')]:draw.text((x,8),label,fill=(235,235,240),font=font);sheet.paste(Image.open(thumb/f'{name}.png'),(x,32))
sheet.save(out/'review-contact-sheet.png')
regions={'near':[1000,120,1920,1080],'middle':[120,150,1060,960],'far':[230,320,760,760]}
for name in ['production-C2','neutral-C2']:
 im=Image.open(sources[name]).convert('RGB')
 for key,box in regions.items():
  target=detail/f'{name}-{key}.png';im.crop(box).save(target);records.append({'source':str(sources[name].relative_to(root)),'output':str(target.relative_to(out)),'bounds':box,'method':'Exact unscaled source pixels'})
def pair(a,b,dest):
 a=Image.open(sources[a]).convert('RGB');b=Image.open(sources[b]).convert('RGB');im=Image.new('RGB',(3840,1080));im.paste(a,(0,0));im.paste(b,(1920,0));im.save(out/dest)
pair('before-production-C','production-C','comparison-sameC-production.png')
if 'neutral-C' in sources:pair('before-neutral-C','neutral-C','comparison-sameC-neutral.png')
pair('production-C','production-C2','comparison-framing-C-C2.png')
a=Image.open(sources['target']).convert('RGB').resize((1920,1080),Image.Resampling.LANCZOS);b=Image.open(sources['production-C2']).convert('RGB');im=Image.new('RGB',(3840,1080));im.paste(a,(0,0));im.paste(b,(1920,0));im.save(out/'comparison-reference.png')
(out/'image-provenance.json').write_text(json.dumps({'records':records,'regions':regions,'comparisonLayout':'baseline/target/originalC left; current/evolvedC2 right; concatenation only, target Lanczos resampled to1920x1080','sceneImageColorAdjustments':False},indent=2)+'\n')
print('Saved label-only C2review sheet,320px thumbs,crops,sameC/framing/reference comparisons')
