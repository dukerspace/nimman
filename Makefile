.PHONY: db-up
db-up:
	bash ./scripts/db.sh

.PHONY: install:base
install:base:
	bash ./scripts/install.sh

install:docker:
	bash ./scripts/docker.sh

.PHONY: install:nginx
install:nginx:
	bash ./scripts/nginx.sh

.PHONY: setup-framework
setup-framework:
	bash ./scripts/setup-framework.sh

