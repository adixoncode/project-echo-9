"""Fixed-camera regional light measurements, diagnostic descriptions rather than art acceptance."""
from pathlib import Path
import json,os
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=root/os.environ.get('QA_DIR','docs/qa/overhaul-v1/iteration-2')
regions={'cold_middle_rib':[.43,.12,.50,.66], 'red_depth':[.23,.37,.36,.58],
         'floor_reflection':[.10,.56,.45,.94], 'dark_foreground':[.65,.08,1.,.90]}
result={'method':'Same camera encoded-sRGB patches; regions from preimplementation image-space brief. Different reference framing is not scored with these regions. No thresholds establish artistic acceptance.', 'regions':regions,'captures':{}}
for name,file in [('before','before-clean.png'),('hdr','checkpoints/hdr-clean.png'),('relit','checkpoints/relit-clean.png'),('after','after-clean.png')]:
 path=out/file
 if not path.exists():continue
 rgb=np.asarray(Image.open(path).convert('RGB'),dtype=np.float64)/255
 h,w=rgb.shape[:2];values={}
 for key,(x0,y0,x1,y1) in regions.items():
  patch=rgb[round(y0*h):round(y1*h),round(x0*w):round(x1*w)]
  y=patch@np.array([.2126,.7152,.0722]);red=(patch[:,:,0]>1.6*patch[:,:,1])&(patch[:,:,0]>1.3*patch[:,:,2])&(y>.05)
  values[key]={'meanDisplayLuminance':float(y.mean()),'p95DisplayLuminance':float(np.quantile(y,.95)),
               'meanRgb':patch.mean(axis=(0,1)).tolist(),'visibleRedPixelFraction':float(red.mean())}
 result['captures'][name]=values
(out/'regional-lighting-measurements.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
