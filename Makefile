buildname = ventus

# Set the source directory
srcdir = src/ventus
builddir = build

# Less compiler
#@lessc $< > $(addprefix ${builddir}, $(notdir $@))
lessfiles = $(wildcard ${srcdir}/css/*.less)
templatefiles = $(wildcard ${srcdir}/tpl/*.tpl)
cssfile = ${builddir}/${buildname}.css

# Dependencies
targets = build.js

all: less handlebars debug release

debug: ${targets}
	r.js -o build.js debug=true optimize=none out=${builddir}/${buildname}.js

release: ${targets}
	r.js -o build.js debug=false out=${builddir}/${buildname}.min.js

less: $(lessfiles:.less=.css)
	@echo LESS compiler finished.
	@echo

%.css: %.less
	@echo Compiling LESS $<
	@lessc --yui-compress $< >> ${cssfile}

handlebars: $(templatefiles:.tpl=.tpl.js)
	@echo HANDLEBARS template compiler finished.
	@echo

%.tpl.js: %.tpl
	@echo Compiling HANDLEBARS $<...
	@handlebars --amd $< > $<.js

clean:
	rm -f ${builddir}/${buildname}.js
	rm -f ${builddir}/${buildname}.min.js
	rm -f ${cssfile}
	rm -f $(wildcard ${srcdir}/tpl/*.tpl.js)

install:
	npm install requirejs
	npm install less
	npm install handlebars


