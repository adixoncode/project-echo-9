"""Camera study evidence: thumbnails/contact sheet only, no scene retouching."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageChops
import hashlib, json
root=Path(__file__).resolve().parents[1];out=root/'docs/qa/overhaul-v1/iteration-4b/camera-study'
thumb=out/'thumbnails';thumb.mkdir(exist_ok=True)
metadata=json.loads((out/'capture.json').read_text())
fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font=ImageFont.truetype(fontpath,14);small=ImageFont.truetype(fontpath,12)
sheet=Image.new('RGB',(1000,1080),(18,21,26));draw=ImageDraw.Draw(sheet)
records=[]
sources={'target':root/'docs/references/target-red-corridor.jpg'}
for mode in ['production','neutral']:
 for key in 'ABCD':sources[f'{mode}-{key}']=out/f'{mode}-{key}.png'
for name,path in sources.items():
 image=Image.open(path).convert('RGB');image.resize((320,180),Image.Resampling.LANCZOS).save(thumb/f'{name}.png')
 records.append({'source':str(path.relative_to(root)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'dimensions':image.size,'thumbnail':f'thumbnails/{name}.png','method':'Lanczos320x180; no color/contrast/sharpness adjustment'})
sheet.paste(Image.open(thumb/'target.png'),(10,35));draw.text((10,10),'TARGET',(235,235,240),font=font)
draw.text((350,12),'CAMERA STUDY: EXACT4A SCENE',(235,235,240),font=font)
for i,line in enumerate(['Actual WebGPU1920x1080 / High / DPR1 /4xMSAA','Time12 / seed15515657 / no scene changes','Production and separate neutral diagnostics','Software readback; hardware/temporal gates BLOCKED']):draw.text((350,44+24*i),line,(210,215,225),font=font)
draw.text((10,225),'PRODUCTION',(235,235,240),font=font);draw.text((345,225),'NEUTRAL',(235,235,240),font=font)
for i,shot in enumerate(metadata['shots']):
 y=250+i*205;key=shot['id']
 sheet.paste(Image.open(thumb/f'production-{key}.png'),(10,y));sheet.paste(Image.open(thumb/f'neutral-{key}.png'),(345,y))
 lines=[key+' / '+shot['name'],str(shot['verticalFovDegrees'])+'deg vertical FOV','Position '+str(shot['position']),'Target '+str(shot['target'])]
 for j,line in enumerate(lines):draw.text((680,y+10+30*j),line,(230,233,240),font=small)
sheet.save(out/'camera-contact-sheet.png')
comparisons=[]
for mode,current,baseline in [('production',out/'production-A.png',root/'docs/qa/overhaul-v1/iteration-4a/after-clean.png'),('neutral',out/'neutral-A.png',root/'docs/qa/overhaul-v1/iteration-4a/neutral-clean.png')]:
 a=Image.open(current).convert('RGB');b=Image.open(baseline).convert('RGB');diff=ImageChops.difference(a,b)
 comparisons.append({'mode':mode,'baseline':str(baseline.relative_to(root)),'current':str(current.relative_to(root)),'rgbIdentical':diff.getbbox() is None,'differenceBoundingBox':diff.getbbox()})
 if diff.getbbox() is not None:raise AssertionError(mode+' historicalA pixel mismatch')
(out/'image-provenance.json').write_text(json.dumps({'records':records,'historicalA':comparisons,'contactSheet':'Labels plus unaltered320px thumbnails; no image retouching'},indent=2)+'\n')
print('Saved9thumbnails + contact sheet. HistoricalAproduction/neutral RGB-identical to4A.')
