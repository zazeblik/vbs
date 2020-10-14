const { exec } = require('child_process');
module.exports = function(grunt) {
  grunt.registerTask('compileAssets', [
    'clean:dev',
    'less:dev',
    'copy:dev',
  ]);

  grunt.registerTask('frontend', 'Build frontend', function() {
    exec('cd frontend && npm run build');
  });
};
