"""Final-round evidence: labels and faithful resampling/crops only."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json
root=Path(__file__).resolve().parents[1];out=root/'docs/qa/overhaul-v1/iteration-4b/round-3';r2=root/'docs/qa/overhaul-v1/iteration-4b/round-2';thumb=out/'thumbnails';detail=out/'details';thumb.mkdir(exist_ok=True);detail.mkdir(exist_ok=True);font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
sources={'target':root/'docs/references/target-red-corridor.jpg','production-C3':out/'production-C3.png','neutral-C3':out/'neutral-C3.png','R2-production':r2/'production-C2.png','R2-neutral':r2/'neutral-C2.png'}
for name in ['old-lights-C3','production-C3-hud']:
 if (out/(name+'.png')).exists():sources[name]=out/(name+'.png')
records=[]
for name,path in sources.items():
 im=Image.open(path).convert('RGB');im.resize((320,180),Image.Resampling.LANCZOS).save(thumb/f'{name}.png');records.append({'source':str(path.relative_to(root)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'output':f'thumbnails/{name}.png','method':'Lanczos320x180 only; no retouching'})
sheet=Image.new('RGB',(1000,220),(18,21,26));draw=ImageDraw.Draw(sheet)
for x,name,label in [(10,'target','TARGET'),(340,'production-C3','C3'),(670,'neutral-C3','C3 / NEUTRAL')]:draw.text((x,8),label,fill=(235,235,240),font=font);sheet.paste(Image.open(thumb/f'{name}.png'),(x,32))
sheet.save(out/'review-contact-sheet.png')
# Image-only candidate comparison: columnA=preservedR2C2, columnB=C3.
compare=Image.new('RGB',(670,420),(18,21,26));d=ImageDraw.Draw(compare);d.text((10,8),'A',fill=(235,235,240),font=font);d.text((340,8),'B',fill=(235,235,240),font=font)
for x,y,name in [(10,32,'R2-production'),(340,32,'production-C3'),(10,230,'R2-neutral'),(340,230,'neutral-C3')]:compare.paste(Image.open(thumb/f'{name}.png'),(x,y))
compare.save(out/'comparison-R2-C3.png')
regions={'near':[1000,120,1920,1080],'middle':[100,120,1120,1000],'far':[200,260,860,760]}
for name in ['production-C3','neutral-C3']:
 im=Image.open(sources[name]).convert('RGB')
 for key,box in regions.items():
  target=detail/f'{name}-{key}.png';im.crop(box).save(target);records.append({'source':str(sources[name].relative_to(root)),'output':str(target.relative_to(out)),'bounds':box,'method':'Exact unscaled source pixels'})
if 'old-lights-C3' in sources:
 a=Image.open(sources['old-lights-C3']).convert('RGB');b=Image.open(sources['production-C3']).convert('RGB');im=Image.new('RGB',(3840,1080));im.paste(a,(0,0));im.paste(b,(1920,0));im.save(out/'comparison-old-final-lights.png')
 sheet=Image.new('RGB',(670,220),(18,21,26));d=ImageDraw.Draw(sheet);d.text((10,8),'A',fill=(235,235,240),font=font);d.text((340,8),'B',fill=(235,235,240),font=font);sheet.paste(Image.open(thumb/'old-lights-C3.png'),(10,32));sheet.paste(Image.open(thumb/'production-C3.png'),(340,32));sheet.save(out/'lighting-AB-contact-sheet.png')
a=Image.open(sources['target']).convert('RGB').resize((1920,1080),Image.Resampling.LANCZOS);b=Image.open(sources['production-C3']).convert('RGB');im=Image.new('RGB',(3840,1080));im.paste(a,(0,0));im.paste(b,(1920,0));im.save(out/'comparison-reference.png')
(out/'image-provenance.json').write_text(json.dumps({'records':records,'regions':regions,'R2C3Comparison':'A=R2C2, B=C3; production top, neutral bottom. Different existing candidates/cameras, not a controlled geometry A/B.','lightingComparison':'A=oldrendererlights, B=finalrendererlights, finalgeometry+materialstreams+camera heldfixed; runtime hashes establish identity.','referenceComparison':'targetleft Lanczos1920x1080; C3right exact pixels','sceneImageColorAdjustments':False},indent=2)+'\n');print('Saved finalreview/R2comparison sheets, faithful320px thumbnails,crops/reference/lightA-B ifavailable')
