# sudowrt-web-ui

This is a work in progress. Some of this works, but please please don't try to package this and add it to a router if you're not in active development.

# Usage

You can test this web app without a sudowrt install by running:

```
npm install
node server.js
```

# Structure

This repository holds the source and build tools for the front end of the sudomesh web admin app. It also holds some of the back end source code. In order to a "proper" openwrt build of this app, the /luci/sudowrt-web-ui/Makefile feed will pull in files from this repo and package them such that on install, they will be copied to the appropriate locations on the router.


## Real Back-End 

The files under `./server-build` will be copied to the router with matching paths. (I believe at the moment the Makefile in the separate feeds repo will need to be updated for additional files). 
There aren't many things that we need back end functionality for, but json-rpcd does provide for extensibility such that you can register your own endpoints in case we're in need of extra functionality. 
At the moment I'm currently just using it to change the root password, mostly as a template so that we know how to build 
similar extensions in the future.

## Fake Back-End 

The fake back end is a nodejs+express app which roughly emulates the behavior of an openwrt router. The openwrt documentation here is severely lacking and appears to be a bit of a moving target, so alignment might be hit or miss here.

When testing the web app, some luci2 API calls will return fake (but potentially plausible) responses. Some API calls will not correspond correctly with the json-rpcd/ubus/uhttpd responses. 

 
To start the server:
```
npm install
node server.js
```

If you want to get really fancy, you can use nodemon to monitor changes in the back end code 
```
./node_modules/nodemon/bin/nodemon.js server.js
```

When testing the web app, some luci2 API calls will return fake (but potentially plausible) responses. Some API calls will not correspond correctly with the json-rpcd/ubus/uhttpd responses. 

At the moment there are no other backend options, though we're considering the following:
 - A scp/rsync build step with a watch process which will automatically push new code to a router for easier testing
 - Some fancy virtualization option, probably with mac80211_hwsim and a Vagrant-ish tool?


## Front-End 

We're using gulp as a build tool, browserify for library management, riotjs for component/views functionality, and less for styles.

The front-end files are all within `./web-src`:
```
web-src/
├── js/
│   ├── tags/
│   ├── libs/
│   ├── main.js
│   ├── section-configs.js
│   └── dashboard-store.js
├── less/
├── fonts/
├── images/
├── bower.json/
└── bower_components/
```

### Riotjs

[Riotjs](https://muut.com/riotjs/) is a "react-like user interface micro-library". It uses "tag" files which a browserify transform compiles to something that a web client can understand. It follows in the reactjs/web-components model of mixing html templating with the applicable logic. The tag files are all under the directory `tags/` and end with the extension `.tag`. It's an arbitrary extension which is set up in browserify gulp task and could be changed if anyone felt opinionated about it ;)  Also, the tag files are in ES6 (another fancy browserify transform). I'm not 100% sure whether we should go back to just using ES5 for the riot tags or if we should consider migrating the rest of the javascript to ES6. We'll see how things progress.

In the steps of micro-react, we're using a flux-like store to handle application state. Riotjs provides event emitter and `observable` functionality, which we leverage for it.

Riotjs is also handling routing, though we could very easily swap in another front-end routing library. If we end up needing more complicated routing, I think [Page.js](https://visionmedia.github.io/page.js/) is a pretty cool option. 

### Less

We're using less for styles. Right now pretty much everything is in the `less/admin-styles.less` file. We use imports to bring in fonts, but that's about it. THE STYLE CODE NEEDS A LOT OF WORK. 


### Bower

I'm not sure that we'll end up needing bower for much, but I was being lazy and wanted the bootstrap glyphicons. If there are any other libraries we decide we want/need that aren't on npm, we can use bower to keep track of them. It can be occasionally difficult to include them into the browserify pipeline, but it's pretty much always possible.

### Gulp 

We use gulp to build the front end files. It takes the appropriate files in `web-src` and builds them into `web-build`.

The `gulpfile.js` in the root directory just includes the tasks in `gulp/tasks/*.js`

```
gulp/
├── config.js/
├── index.js/
└── tasks/
│   ├── browserify.js
│   ├── build.js
│   ├── clean.js
│   ├── default.js
│   ├── html.js
│   ├── images.js
│   ├── less.js
│   ├── static.js
│   └── watch.js
```

`config.js` has any of the configurations for the build steps. Right now that's just some options to pass to the imagemin parser.

To run the default gulp task, you can run `./node_modules/gulp/bin/gulp.js`. If you have gulp installed globally, you can probably just run `gulp` in the repo root directory, but any version issues are yours to deal with ;). 

There's a 'production' build step which uses a variety of minifications, removes source maps, etc. and then names the css and js bundle.min.js and bundle.min.css. There's no real step for including those in the `index.html` file as part of the process, but this is still early days.

## UCI/Input configs

At the moment I've got `web-src/js/section-configs.js` which provides for configuring what options should be editable. It's still pretty brittle and very much a work in progress.  

## Reference Apps

In `./reference-apps` there's the original luci2 code, a version of the eff app which we took inspiration from, and the previous iteration of our app just to hold on to.  for later reference.

You might be able to view them live if you adjust the first few lines in server.js:
```
// If we want to try to serve the luci2_app 
// app.use(express.static(path.join(path.join(__dirname, 'reference-apps'), 'luci2_app')));

// If we want to try to serve the eff app 
// app.use(express.static(path.join(path.join(__dirname, 'reference-apps'), 'eff_app')));

// If we want to try to serve our first draft
// app.use(express.static(path.join(__dirname, 'reference-apps')));

// If we want to serve static content from our build path
app.use(express.static(path.join(__dirname, 'web-build')));
```

The other reference apps don't really work as is, but the code is sometimes illuminating. 
It probably won't take much to get them working, but then I really don't know.


There are 
# Attribution

This is based on the [luci2](http://wiki.openwrt.org/doc/techref/luci2) client side web admin interface and the [EFF Open Wireless router](https://github.com/EFForg/OpenWireless) web admin interface.

# License

This software is licensed under the AGPLv3.
