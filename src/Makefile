# Makefile

# Define the commands to start each server
ESPN_PROXY_CMD = node espn-proxy/server.js

CORS_SERVER_CMD = python3 cors_server.py

# Define the ports each server is running on
ESPN_PROXY_PORT = 3000
CORS_SERVER_PORT = 8000

# Define the targets
.PHONY: all espn-proxy player-selector cors-server start stop

# Default target that starts all servers
all: start

# Check if a port is in use
define check_port
	@if lsof -i :$(1) > /dev/null; then \
		echo "Port $(1) is already in use"; \
		exit 1; \
	else \
		echo "Port $(1) is available"; \
	fi
endef

# Target to start the espn-proxy server
espn-proxy:
	@echo "Starting espn-proxy server..."
	$(call check_port, $(ESPN_PROXY_PORT))
	$(ESPN_PROXY_CMD) &

# Target to start the player-selector server
# Target to start the cors server
cors-server:
	@echo "Starting cors-server..."
	$(call check_port, $(CORS_SERVER_PORT))
	$(CORS_SERVER_CMD) &

# Target to start all servers
start: espn-proxy player-selector cors-server
	@echo "All servers started."

# Target to stop all servers
stop:
	@echo "Stopping all servers..."
	@pkill -f "$(PLAYER_SELECTOR_CMD)" || true
	@pkill -f "$(CORS_SERVER_CMD)" || true
	@echo "All servers stopped."
