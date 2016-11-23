'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const ONE_HOUR_AGO = Date.now() - 60 * 60 * 1000
const HOME_REGEX = new RegExp('^' + os.homedir())

class File {
  constructor (name, dir) {
    this.name = name
    this.path = path.join(dir, name)
    this.stats = null
  }

  isViewable (exclude) {
    const isHidden = this.path.match(/\/\.[^\/]+$/)
    const isExcluded = exclude.indexOf(this.path) !== -1
    return !isHidden && !isExcluded
  }

  isApp () {
    let isLinuxApp
    if (process.platform !== 'win32') {
      const isGroup = gid ? process.getgid && gid === process.getgid() : true;
      const isUser = uid ? process.getuid && uid === process.getuid() : true;

      isLinuxApp = Boolean((mode & parseInt('0001', 8)) ||
        ((mode & parseInt('0010', 8)) && isGroup) ||
        ((mode & parseInt('0100', 8)) && isUser));
    }
    const isMacApp = !!this.name.match(/\.(prefPane|app)$/)
    const isWinApp = !!this.name.match(/\.(exe)$/)
    //return isMacApp || isWinApp || isLinuxApp
    return isMacApp || isWinApp || true
  }

  isDirectory () {
    const isDirectory = this.stats.isDirectory()
    const isSymbolicLink = this.stats.isSymbolicLink()
    return isDirectory && !isSymbolicLink && !this.isApp()
  }

  isBroken () {
    return !this.stats
  }

  relativePath () {
    return this.path.replace(HOME_REGEX, '~')
  }

  toJson () {
    return {
      icon: this.isDirectory() ? 'fa-folder' : 'fa-file',
      title: this.name.split('.')[0],
      subtitle: this.relativePath(),
      value: this.relativePath(),
      id: this.relativePath(),
    }
  }

  getStats () {
    return new Promise((accept, reject) => {
      fs.stat(this.path, (err, stats) => {
        if (!err) this.stats = stats
        accept()
      })
    })
  }
}

module.exports = File
