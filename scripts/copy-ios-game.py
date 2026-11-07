"""Copy only public game resources into the iOS app bundle."""
from pathlib import Path
import shutil
import sys
root=Path(__file__).resolve().parents[1]
destination=Path(sys.argv[1])
destination.mkdir(parents=True,exist_ok=True)
for name in ['index.html','private-bay.js','island-walk.js','world-land.json','boat-trailer.png','apple-touch-icon.png','manifest.webmanifest']:
 shutil.copy2(root/name,destination/name)
shutil.copytree(root/'assets',destination/'assets',dirs_exist_ok=True)
