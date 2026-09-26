"""Verificações locais de empacotamento, não avaliações da inteligência do agente.

Adaptação para o repositório skillsTT: as verificações do pacote TT Skills 0.1.0
foram restringidas às três skills `tt-*`. O pacote original exigia que `skills/`
contivesse exatamente três pastas; neste repositório ele convive com
`motion-design` e `clubett-identidade-visual`, que têm frontmatter do próprio
repositório de origem e não seguem o schema do pacote TT. Nenhuma verificação de
conteúdo foi relaxada: os arquivos verificados são os mesmos.
"""
import re
import unittest
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
TT_SKILLS = ['tt-editorial', 'tt-instagram', 'tt-visual']
ALL_SKILLS = ['clubett-identidade-visual', 'motion-design',
              'tt-editorial', 'tt-instagram', 'tt-visual']


def tt_skill_files():
    return sorted((ROOT / 'skills').glob('tt-*/SKILL.md'))


class TestBundle(unittest.TestCase):
    def test_three_tt_skills_and_no_extra_tt_skill(self):
        names = sorted(p.parent.name for p in tt_skill_files())
        self.assertEqual(names, TT_SKILLS)

    def test_frontmatter_and_context_size(self):
        for path in tt_skill_files():
            with self.subTest(skill=path.parent.name):
                text = path.read_text(encoding='utf-8')
                parts = text.split('---', 2)
                self.assertEqual(parts[0], '')
                data = yaml.safe_load(parts[1])
                self.assertEqual(data['name'], path.parent.name)
                self.assertRegex(data['name'], r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
                self.assertLessEqual(len(data['name']), 64)
                self.assertGreater(len(data['description']), 0)
                self.assertLessEqual(len(data['description']), 1024)
                self.assertLess(len(text.splitlines()), 500)
                self.assertTrue(all(isinstance(k, str) and isinstance(v, str) for k, v in data['metadata'].items()))
                self.assertLessEqual(len(data.get('compatibility', '')), 500)
                self.assertNotIn('allowed-tools', data)

    def test_all_direct_skill_links_resolve(self):
        for path in tt_skill_files():
            links = re.findall(r'\]\(([^)]+)\)', path.read_text())
            for link in links:
                with self.subTest(skill=path.parent.name, link=link):
                    self.assertNotIn('://', link)
                    target = (path.parent / link).resolve()
                    self.assertTrue(target.is_relative_to(path.parent.resolve()))
                    self.assertTrue(target.is_file(), link)

    def test_no_font_files_or_credentials(self):
        forbidden = {'.ttf', '.otf', '.woff', '.woff2', '.env', '.pem', '.key'}
        for path in ROOT.rglob('*'):
            if path.is_file() and '.git/' not in str(path):
                self.assertNotIn(path.suffix.lower(), forbidden)
                self.assertNotEqual(path.name, '.env')

    def test_required_reference_assets(self):
        assets = ROOT / 'skills' / 'tt-visual' / 'assets'
        for name in ['gramatica-visual.pdf','gramatica-p07.png','gramatica-p09.png',
                     'capa-post-clara-referencia.jpg','capa-post-teal-referencia.jpg','capa-temporada-referencia.jpg']:
            self.assertGreater((assets / name).stat().st_size, 1000)

    def test_eval_cases_not_claimed_as_executed(self):
        import json
        data = json.loads((ROOT / 'evals/casos.json').read_text())
        self.assertEqual(data['status'], 'not_executed_in_agent_runtime')
        self.assertGreaterEqual(len(data['cases']), 12)
        self.assertEqual(len({c['id'] for c in data['cases']}), len(data['cases']))

    def test_all_five_skills_have_a_skill_file(self):
        names = sorted(p.parent.name for p in (ROOT / 'skills').glob('*/SKILL.md'))
        self.assertEqual(names, ALL_SKILLS)


if __name__ == '__main__':
    unittest.main()
