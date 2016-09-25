module.exports = {
  dist: {
    options: {
      // cssmin will minify later
      style: 'expanded',
      lineNumbers:true
    },
    files: {
      'dist/_css/<%= pkg.name %>.css': 'src/<%= pkg.name %>.scss'
    }
  }
}