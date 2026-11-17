"""Early media-only sheet for independent camera review while neutral capture runs."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import hashlib,json
root=Path(__file__).resolve().parents[1];out=root/'docs/qa/overhaul-v1/iteration-4b/camera-study';thumb=out/'thumbnails';thumb.mkdir(exist_ok=True)
sheet=Image.new('RGB',(1000,440),(18,21,26));draw=ImageDraw.Draw(sheet);font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
records=[]
for i,key in enumerate(['target','A','B','C','D']):
 path=root/'docs/references/target-red-corridor.jpg' if key=='target' else out/f'production-{key}.png'
 image=Image.open(path).convert('RGB').resize((320,180),Image.Resampling.LANCZOS);image.save(thumb/('target.png' if key=='target' else f'production-{key}.png'))
 x=10+(i%3)*330;y=10+(i//3)*215;draw.text((x,y),'TARGET' if key=='target' else key,fill=(235,235,240),font=font);sheet.paste(image,(x,y+25))
 records.append({'source':str(path.relative_to(root)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'thumbnailSize':[320,180],'method':'Lanczos only; no grading/retouching'})
sheet.save(out/'production-contact-sheet.png');(out/'production-contact-sheet-provenance.json').write_text(json.dumps(records,indent=2)+'\n')
print('production-contact-sheet.png and all4production320px thumbnails saved')
