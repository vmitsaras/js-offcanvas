module.exports = {

     options: {
        banner: '<%= banner %>',
        stripBanners: true,
         
        processors: [
            
          require('autoprefixer')({
                    })
            
        ]
      },
  dist: {
        src: 'dist/_css/<%= pkg.name %>.css',
        dest: 'dist/_css/prefixed/<%= pkg.name %>.css'
      }
}

    
 