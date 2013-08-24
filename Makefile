SRCS = infragram.js

all : $(SRCS)

%.js : %.coffee
	coffee --compile --bare $<

commit : $(SRCS)
	git commit $(SRCS:.coffee=.js) -m "Update javascript"
