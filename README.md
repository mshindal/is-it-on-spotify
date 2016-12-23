# is-it-on-spotify
Is it on Spotify? Find out with this small webapp! Try it out at https://mshindal.github.io/is-it-on-spotify/

## Building
You'll need `node`, `npm`, `bower`, and `grunt`. Download dependencies with `npm install` and then `bower install`. Then run `grunt` to compile source files and copy the compiled files over to the public directory.

For development, `dev-server.js` contains a simple HTTP server that will host everything in the public directory. Run `node dev-server.js` to host the app on http://localhost:8080. Additionally, `grunt watch` will watch for changes to Handlebars templates and Less source files and will automatically re-compile them if they change. 
