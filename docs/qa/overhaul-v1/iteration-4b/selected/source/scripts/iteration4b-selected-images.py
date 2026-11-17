"""Non-art selected-candidate integration proof: exact RGB identity to reviewedR2."""
from pathlib import Path
from PIL import Image,ImageChops,ImageDraw,ImageFont
import hashlib,json
root=Path(__file__).resolve().parents[1];out=root/'docs/qa/overhaul-v1/iteration-4b/selected';baseline=root/'docs/qa/overhaul-v1/iteration-4b/round-2';thumb=out/'thumbnails';thumb.mkdir(exist_ok=True);records=[];comparisons=[]
for mode in ['production','neutral']:
 current=out/f'{mode}-C2.png';old=baseline/f'{mode}-C2.png';a=Image.open(current).convert('RGB');b=Image.open(old).convert('RGB');assert a.size==b.size==(1920,1080);delta=ImageChops.difference(a,b);bbox=delta.getbbox();comparisons.append({'mode':mode,'selected':str(current.relative_to(root)),'selectedSha256':hashlib.sha256(current.read_bytes()).hexdigest(),'reviewedBaseline':str(old.relative_to(root)),'baselineSha256':hashlib.sha256(old.read_bytes()).hexdigest(),'rgbIdentical':bbox is None,'differenceBoundingBox':bbox,'differentRgbPixels':sum(any(c for c in p) for p in delta.getdata())})
 if bbox is not None:raise AssertionError(mode+' selected integration image differs from reviewedR2C2')
sources={'target':root/'docs/references/target-red-corridor.jpg','production-C2':out/'production-C2.png','neutral-C2':out/'neutral-C2.png','production-C2-hud':out/'production-C2-hud.png'}
for name,path in sources.items():
 im=Image.open(path).convert('RGB');im.resize((320,180),Image.Resampling.LANCZOS).save(thumb/f'{name}.png');records.append({'source':str(path.relative_to(root)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'output':f'thumbnails/{name}.png','method':'Lanczos320x180 only, no grading/retouching'})
sheet=Image.new('RGB',(1000,220),(18,21,26));d=ImageDraw.Draw(sheet);font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
for x,name,label in [(10,'target','TARGET'),(340,'production-C2','C2'),(670,'neutral-C2','C2 / NEUTRAL')]:d.text((x,8),label,fill=(235,235,240),font=font);sheet.paste(Image.open(thumb/f'{name}.png'),(x,32))
sheet.save(out/'selected-contact-sheet.png');(out/'image-provenance.json').write_text(json.dumps({'integrationStatus':'PASS','rgbIdentityToReviewedR2':comparisons,'thumbnails':records,'newArtisticCandidate':False},indent=2)+'\n');print('PASS: selected production +neutral RGB pixel-identical to reviewedR2C2; named-HUD retained.')
