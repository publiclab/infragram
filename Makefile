all : infragram.js

%.js : %.coffee
	coffee --compile --bare $<
	git commit $@ -m "Update $@"
