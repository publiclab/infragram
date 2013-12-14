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
       dispatch.coffee

# Detect operating system.
UNAME = $(shell uname -s)
ifeq ($(strip $(UNAME)),)
	UNAME = NT
endif

# Select remove command based on current OS.
RM_CMD = rm
ifneq (,$(findstring NT,$(UNAME)))
	RM_CMD = cmd /C del
endif


all : $(TARGET)

$(TARGET) : $(SRCS)
	coffee --compile --bare --join $@ $^

commit : $(TARGET)
	git commit $^ -m "Update javascript"

clean : $(TARGET)
	$(RM_CMD) $^
