"""Testes de arquivos sintéticos; nenhuma publicação nem acesso a conta real."""
from __future__ import annotations
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

def load(name: str, relative: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

car = load('carousel', 'skills/tt-instagram/scripts/carousel.py')
con = load('contrast', 'skills/tt-visual/scripts/contrast.py')


class TestContrast(unittest.TestCase):
    def test_identical(self):
        self.assertEqual(con.contrast_ratio('#256675', '#256675'), 1)

    def test_black_white(self):
        self.assertAlmostEqual(con.contrast_ratio('#000000', '#FFFFFF'), 21)

    def test_teal_paper(self):
        self.assertGreater(con.contrast_ratio('#256675', '#F2EFEB'), 4.5)

    def test_medium_teal_small_text_fails(self):
        self.assertLess(con.contrast_ratio('#4B8C99', '#F2EFEB'), 4.5)

    def test_invalid_color(self):
        with self.assertRaises(ValueError):
            con.contrast_ratio('teal', '#FFFFFF')


class TestCarousel(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.base = Path(self.temp.name)
        self.path = self.base / 'manifest.json'
        slides=[]
        for i in range(4):
            name=f'origem-{i}.png'
            Image.new('RGB', (320,400), (50+i*35,90+i*20,115+i*12)).save(self.base/name)
            role='post_cover' if i==0 else ('season_closing' if i==3 else 'argument')
            slides.append({'position':i+1,'id':f'quadro-{i+1}','role':role,'file':name,
                           'copy_text':f'Frase de teste {i+1}.','alt_text':f'Descrição de teste {i+1}.',
                           'copy_status':'approved'})
        self.m={'schema_version':'1.0','campaign_id':'teste-local','account_username':'conta_teste',
                'target':{'width':320,'height':400,'background':'#F2EFEB'},
                'caption':'Legenda de teste, sem publicação.', 'slides':slides}
        self.save()

    def tearDown(self):
        self.temp.cleanup()

    def save(self):
        car.dump(self.path,self.m)

    def test_valid_manifest(self):
        r=car.validate(self.path,strict=True,require_target=True)
        self.assertTrue(r['ok'],r['errors'])

    def test_array_order_is_not_silently_sorted(self):
        self.m['slides'][1],self.m['slides'][2]=self.m['slides'][2],self.m['slides'][1]
        self.save()
        self.assertFalse(car.validate(self.path)['ok'])

    def test_duplicate_id(self):
        self.m['slides'][1]['id']=self.m['slides'][0]['id']; self.save()
        self.assertFalse(car.validate(self.path)['ok'])

    def test_duplicate_file(self):
        self.m['slides'][1]['file']=self.m['slides'][0]['file']; self.save()
        self.assertFalse(car.validate(self.path)['ok'])

    def test_season_cover_cannot_open(self):
        self.m['slides'][0]['role']='season_closing'; self.m['slides'][-1]['role']='post_cover'; self.save()
        self.assertFalse(car.validate(self.path)['ok'])

    def test_missing_file(self):
        self.m['slides'][0]['file']='nao-existe.png'; self.save()
        self.assertFalse(car.validate(self.path)['ok'])

    def test_path_escape(self):
        self.m['slides'][0]['file']='../outro.png'; self.save()
        self.assertFalse(car.validate(self.path)['ok'])

    def test_absolute_path_rejected(self):
        self.m['slides'][0]['file']=str(self.base/'origem-0.png'); self.save()
        self.assertFalse(car.validate(self.path)['ok'])

    def test_symlink_escape(self):
        with tempfile.TemporaryDirectory() as other:
            f=Path(other)/'image.png'; Image.new('RGB',(320,400)).save(f)
            (self.base/'escape.png').symlink_to(f)
            self.m['slides'][0]['file']='escape.png'; self.save()
            self.assertFalse(car.validate(self.path)['ok'])

    def test_pending_copy_rejected_in_strict_mode(self):
        self.m['slides'][0]['copy_status']='pending'; self.save()
        self.assertTrue(car.validate(self.path)['ok'])
        self.assertFalse(car.validate(self.path,strict=True)['ok'])

    def test_placeholder_rejected_in_strict_mode(self):
        self.m['caption']='Convite {{link}}'; self.save()
        self.assertFalse(car.validate(self.path,strict=True)['ok'])

    def test_external_limits_are_parameters(self):
        self.assertFalse(car.validate(self.path,max_items=3)['ok'])
        self.assertFalse(car.validate(self.path,max_bytes=100)['ok'])
        self.assertFalse(car.validate(self.path,caption_limit=4)['ok'])
        self.assertFalse(car.validate(self.path,alt_limit=4)['ok'])

    def test_invalid_fields_fail_without_crashing(self):
        self.m['slides'][1]['role']=['bad']; self.m['slides'][2]['copy_status']={}; self.save()
        self.assertFalse(car.validate(self.path)['ok'])
        self.m['slides'][0]=12; self.save()
        self.assertFalse(car.validate(self.path)['ok'])

    def test_exif_orientation(self):
        ex=Image.Exif(); ex[274]=6
        Image.new('RGB',(400,320)).save(self.base/'rotated.jpg',exif=ex)
        self.m['slides'][0]['file']='rotated.jpg'; self.save()
        self.assertTrue(car.validate(self.path,require_target=True)['ok'])

    def test_transparency_is_flattened(self):
        Image.new('RGBA',(320,400),(0,0,0,0)).save(self.base/'transparent.png')
        self.m['slides'][0]['file']='transparent.png'; self.save()
        out=self.base/'export'
        car.export(self.path,out)
        with Image.open(out/'01-quadro-1.jpg') as im:
            self.assertEqual(im.mode,'RGB')
            self.assertTrue(im.info.get('icc_profile'))
            self.assertTrue(all(abs(a-b)<=2 for a,b in zip(im.getpixel((10,10)),(242,239,235))))

    def test_invalid_icc_fails(self):
        Image.new('RGB',(320,400)).save(self.base/'broken.png',icc_profile=b'broken-profile')
        self.m['slides'][0]['file']='broken.png'; self.save()
        self.assertFalse(car.validate(self.path)['ok'])

    def test_unprofiled_cmyk_fails(self):
        Image.new('CMYK',(320,400)).save(self.base/'cmyk.jpg')
        self.m['slides'][0]['file']='cmyk.jpg'; self.save()
        self.assertFalse(car.validate(self.path)['ok'])

    def test_export_order_dimensions_profiles(self):
        out=self.base/'export'
        car.export(self.path,out)
        r=car.validate(out/'manifest.json',strict=True,require_target=True)
        self.assertTrue(r['ok'],r['errors'])
        self.assertEqual([x['file'] for x in r['items']], [f'{i:02d}-quadro-{i}.jpg' for i in range(1,5)])
        for f in out.glob('*.jpg'):
            with Image.open(f) as im:
                self.assertEqual(im.size,(320,400)); self.assertTrue(im.info.get('icc_profile'))
        self.assertTrue((self.base/'origem-0.png').is_file())

    def test_no_overwrite(self):
        out=self.base/'export'; out.mkdir(); marker=out/'manter.txt'; marker.write_text('ok')
        with self.assertRaises(ValueError): car.export(self.path,out)
        self.assertEqual(marker.read_text(),'ok')

    def test_wrong_ratio_refused_and_cleanup(self):
        Image.new('RGB',(400,400)).save(self.base/'origem-0.png')
        out=self.base/'export'
        with self.assertRaises(ValueError): car.export(self.path,out)
        self.assertFalse(out.exists())
        self.assertFalse(list(self.base.glob('.tt-carousel-*')))

    def test_contain_explicit_permission(self):
        Image.new('RGB',(400,400)).save(self.base/'origem-0.png')
        r=car.export(self.path,self.base/'export',fit='contain')
        self.assertTrue(r['warnings'])

    def test_upscale_requires_permission(self):
        Image.new('RGB',(160,200)).save(self.base/'origem-0.png')
        with self.assertRaises(ValueError): car.export(self.path,self.base/'bad')
        r=car.export(self.path,self.base/'good',allow_upscale=True)
        self.assertTrue(r['warnings'])

    def test_fingerprint_changes_with_caption(self):
        f=car.fingerprint(self.path); self.m['caption']+=' Mudou.'; self.save()
        self.assertNotEqual(f,car.fingerprint(self.path))

    def test_fingerprint_changes_with_slide_order(self):
        f=car.fingerprint(self.path)
        self.m['slides'][1],self.m['slides'][2]=self.m['slides'][2],self.m['slides'][1]
        for i,s in enumerate(self.m['slides'],1): s['position']=i
        self.save(); self.assertNotEqual(f,car.fingerprint(self.path))

    def test_fingerprint_changes_with_pixels(self):
        f=car.fingerprint(self.path); Image.new('RGB',(320,400),'red').save(self.base/'origem-0.png')
        self.assertNotEqual(f,car.fingerprint(self.path))

    def approval(self):
        a={'schema_version':'1.0','action':'publish','status':'authorized','account_username':'conta_teste',
           'content_fingerprint':car.fingerprint(self.path),'authorized_by':'Pessoa fictícia no teste',
           'authorized_at':'2026-09-26T12:00:00+00:00','user_instruction':'Teste sintético, sem envio real.',
           'timing':'now'}
        ap=self.base/'approval.json'; car.dump(ap,a); return ap

    def test_approval_consistency_not_publication(self):
        ap=self.approval(); r=car.check_approval(self.path,ap)
        self.assertTrue(r['ok']); self.assertIn('não publica',r['note'])
        self.m['caption']='Outra legenda'; self.save()
        self.assertFalse(car.check_approval(self.path,ap)['ok'])

    def test_pending_approval_rejected(self):
        ap=self.approval(); a=car.read_json(ap); a['status']='pending'; car.dump(ap,a)
        self.assertFalse(car.check_approval(self.path,ap)['ok'])

    def test_preview_escapes_caption(self):
        self.m['caption']='<script>alert(1)</script>'; self.save()
        out=self.base/'review'; car.preview(self.path,out)
        page=(out/'index.html').read_text()
        self.assertIn('&lt;script&gt;',page); self.assertNotIn('<script>',page)
        self.assertIn('data:image/jpeg;base64,',page)
        self.assertTrue((out/'visao-geral.jpg').is_file())

    def test_zip_contains_order_and_no_extra_metadata(self):
        self.m['secret_do_not_export']='dummy'; self.m['target']['extra_secret']='dummy'; self.save()
        out=self.base/'export'; car.export(self.path,out)
        z=self.base/'post.zip'; car.package(out/'manifest.json',z)
        with zipfile.ZipFile(z) as f:
            photos=[n for n in f.namelist() if n.endswith('.jpg')]
            self.assertEqual(photos,[f'{i:02d}-quadro-{i}.jpg' for i in range(1,5)])
            m=json.loads(f.read('manifest.json'))
            self.assertNotIn('secret_do_not_export',m); self.assertNotIn('extra_secret',m['target'])
            self.assertFalse(json.loads(f.read('revisao.json'))['publication_authorized'])
            self.assertIsNone(f.testzip())

    def test_package_requires_export(self):
        with self.assertRaises(ValueError): car.package(self.path,self.base/'post.zip')

    def test_cli_help(self):
        r=subprocess.run([sys.executable,str(ROOT/'skills/tt-instagram/scripts/carousel.py'),'--help'],capture_output=True,text=True)
        self.assertEqual(r.returncode,0); self.assertIn('fingerprint',r.stdout)

    def test_script_has_no_network_import(self):
        import ast
        source=(ROOT/'skills/tt-instagram/scripts/carousel.py').read_text()
        imports=[]
        for n in ast.walk(ast.parse(source)):
            if isinstance(n,ast.Import): imports += [a.name for a in n.names]
            if isinstance(n,ast.ImportFrom): imports.append(n.module or '')
        self.assertFalse(set(imports)&{'requests','http','urllib','socket','composio'})


if __name__=='__main__':
    unittest.main()
