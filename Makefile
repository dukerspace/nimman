.PHONY: db-up
db-up:
	bash ./scripts/db.sh

.PHONY: install
install:
	bash ./scripts/install.sh

.PHONY: nginx
nginx:
	bash ./scripts/nginx.sh
