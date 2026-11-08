"""Build the complete game, then publish only the public resources."""
from pathlib import Path
import subprocess
import sys
root=Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,str(root/'scripts/build-city-expansion.py')],check=True)
subprocess.run([sys.executable,str(root/'scripts/copy-ios-game.py'),str(root/'dist')],check=True)
print('Web game ready in dist; all required game modules embedded.')
