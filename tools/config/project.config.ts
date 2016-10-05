import { join } from 'path';

import { SeedConfig } from './seed.config';
import { Environments, InjectableDependency } from './seed.config.interfaces';

/**
 * This class extends the basic seed configuration, allowing for project specific overrides. A few examples can be found
 * below.
 */
export class ProjectConfig extends SeedConfig {

  PROJECT_TASKS_DIR = join(process.cwd(), this.TOOLS_DIR, 'tasks', 'project');

  FONTS_DEST = `${this.APP_DEST}/assets/font`;
  FONTS_SRC = [
    'src/client/assets/fonts/**'
  ];
  SASS_SRC = [
    'src/client/sass/bootstrap.scss'
    // , 'src/client/sass/global/plugins/select2.scss'
    , 'src/client/sass/global/*.scss'
    , 'src/client/sass/apps/*.scss'
    , 'src/client/sass/app/*.scss'
    , 'src/client/sass/pages/*.scss'
    , 'src/client/sass/layouts/layout/*.scss'
    , 'src/client/sass/layouts/layout/*.scss'
    , 'src/client/sass/layouts/layout/themes/*.scss'
    , 'src/client/sass/layouts/layout5/*.scss'
    , 'src/client/sass/layouts/mega-menu/*.scss'
    , 
  ];
  CSS_SRC = `${this.APP_SRC}/assets/css`;
  CSS_DEST = `${this.APP_DEST}/assets/css`;
  JS_DEST = `${this.APP_DEST}/assets/js`;

  constructor() {
    super();
    this.APP_TITLE = 'Farid App';

    this.SYSTEM_CONFIG_DEV.paths['angular2-jwt'] = `${this.APP_BASE}node_modules/angular2-jwt/angular2-jwt`;

    this.SYSTEM_BUILDER_CONFIG.packages['angular2-jwt'] = {
      main: 'angular2-jwt.js',
      defaultExtension: 'js'
    }

    /* Enable typeless compiler runs (faster) between typed compiler runs. */
    // this.TYPED_COMPILE_INTERVAL = 5;

    // Add `NPM` third-party libraries to be injected/bundled.
    this.NPM_DEPENDENCIES = [
      ...this.NPM_DEPENDENCIES,
      // {src: 'jquery/dist/jquery.min.js', inject: 'libs'},
      // {src: 'lodash/lodash.min.js', inject: 'libs'},
    ];

    // Add `local` third-party libraries to be injected/bundled.
    this.APP_ASSETS = [
      ...this.APP_ASSETS,
      { src: `${this.CSS_SRC}/main.${this.getInjectableStyleExtension()}`, inject: true, vendor: false },
      // {src: `${this.APP_SRC}/your-path-to-lib/libs/jquery-ui.js`, inject: true, vendor: false}
      // {src: `${this.CSS_SRC}/path-to-lib/test-lib.css`, inject: true, vendor: false},
    ];

    /* Add to or override NPM module configurations: */
    // this.mergeObject(this.PLUGIN_CONFIGS['browser-sync'], { ghostMode: false });
  }

}
