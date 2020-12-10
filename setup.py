from setuptools import setup

setup(name='gorillafy',
      version='0.1.3',
      description='Prepare JavaScript experiments for upload to Gorilla.sc',
      scripts=['bin/gorillafy'],
      url='http://github.com/eointravers/gorillafy',
      author='Eoin Travers',
      author_email='eoin.travers@gmail.com',
      license='MIT',
      include_package_data=True,
      install_requires = [
          'beautifulsoup4 >= 4.9.1',
          'jinja2 >= 2.10.1'
      ],
      packages=['gorillafy'])
