#!/usr/bin/env node

/**
 * holarchy-component-cli
 * adds a holarchy component
 *
 * @author Chase Brenchley <https://github.com/VUMC-Interactive-Web/holarchy-components>
 */

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const fs = require('fs').promises

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

(async () => {
  init({ clear });
  input.includes(`help`) && cli.showHelp(0);

  debug && log(flags);

  const [path, name] = input

  if (!path || !name) {
    console.log('Please include 2 arguments, the first being the path to the component, and the second being the name of the component')
    return false
  }

  try {
    if (!(await fs.lstat(path)).isDirectory()) {
      console.log('Please make sure the first argument is a directory where you\'d like to create the component')
      return false
    }
  } catch (e) {
    console.log('Please make sure the first argument is a directory where you\'d like to create the component')
    return false
  }

  createComponent(path, name)
})();

const createComponent = async (path, name) => {
  const componentPath = `${path}/${name}`
  await fs.mkdir(componentPath
    )
  createIndex(componentPath, name)
  createJs(componentPath, name)
  createCss(componentPath, name)
  createStyleguide(componentPath, name)
}

const createIndex = async (path, name) => {
  const content = `export { default } from './${name}'\n`
  fs.writeFile(`${path}/index.js`, content)
}

const createJs = async (path, name) => {
  const content = `import React from 'react'
import { } from 'prop-types'
import { getTheme, getGlobalStyles, combineStyles } from '../../../../scripts/common'

import wireframe from './css/wireframe.module.css'
import themeChildrensHospital from './css/themes/childrens-hospital.module.css'
import themeVanderbiltHealth from './css/themes/vanderbilt-health.module.css'
import themeWalkinClinics from './css/themes/walkin-clinics.module.css'

const themes = {
  'childrensHospital': themeChildrensHospital,
  'vanderbiltHealth': themeVanderbiltHealth,
  'walkinClinics': themeWalkinClinics
}

const ${name} = (props) => {
  const { theme, ...other } = props

  const styles = getTheme(theme, themes)
  const globalStyles = getGlobalStyles(theme)
  const getClass = (className) => combineStyles(className, [globalStyles, wireframe, styles])

  return (
    <div
      {...other}
    >

    </div>
  )
}

${name}.propTypes = {

}

export default ${name}
`

  fs.writeFile(`${path}/${name}.js`, content)
}

const createCss = async (path, name) => {
  const wireframe = `/* wireframe.module.css */\n`
  const vch = `/* css variables for childrens hospital */
@value variables '../../../../../../../css/global/childrens-hospital/variables.module.css\n`

  const vh = `/* css variables for vanderbilt health */
@value variables '../../../../../../../css/global/vanderbilt-health/variables.module.css\n`

  const wic = `/* css variables for walkin clinics */
@value variables: '../../../../../../../css/global/walkin-clinics/variables.module.css';
`

  await fs.mkdir(`${path}/css/themes`, { recursive: true })

  fs.writeFile(`${path}/css/wireframe.module.css`, wireframe)
  fs.writeFile(`${path}/css/themes/childrens-hospital.module.css`, vch)
  fs.writeFile(`${path}/css/themes/vanderbilt-health.module.css`, vh)
  fs.writeFile(`${path}/css/themes/walkin-clinics.module.css`, wic)
}

const createStyleguide = async (path, name) => {
  const content = `#### Children\'s Hospital\n#### ${name}
\`\`\`jsx
<${name}
  theme='childrens-hospital'

/>
\`\`\`

#### Vanderbilt Health\n#### ${name}
\`\`\`jsx
<${name}
  theme='vanderbilt-health'

/>
\`\`\`

#### Walkin Clinic\n#### ${name}
\`\`\`jsx
<${name}
  theme='walkin-clinics'

/>
\`\`\``

  fs.writeFile(`${path}/${name}.md`, content)
}
