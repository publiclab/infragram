all : infragram.js

%.js : %.coffee
	coffee --compile --bare $<
