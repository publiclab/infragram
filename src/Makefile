# This file is part of infragram-js.
#
# infragram-js is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 2 of the License, or
# (at your option) any later version.
#
# infragram-js is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with infragram-js.  If not, see <http://www.gnu.org/licenses/>.

TARGET = infragram.js

SRCS = infragram.coffee \
       infragram-gl.coffee \
       camera.coffee \
       file-upload.coffee \
       dispatch.coffee

all : $(TARGET)

$(TARGET) : $(SRCS)
	coffee --compile --bare --join $@ $^
#	bash update_hash.sh $@ sandbox/index.html
	bash update_hash.sh $@ ../views/layout.jade

commit : $(TARGET)
	git commit $^ -m "Update javascript"

clean : $(TARGET)
	rm $^
