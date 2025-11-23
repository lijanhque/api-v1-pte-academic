require 'json'

# Get the FD from ENV with a default fallback for testing
NODEIPCFD = (ENV['NODE_CHANNEL_FD'] || 1).to_i

def send_message(message)
  begin
    io = IO.new(NODEIPCFD, 'w')
    json_message = message.to_json + "\n"
    io.write(json_message)
    io.flush
  rescue Errno::EBADF => e
    raise "Error writing to IPC channel: #{e.message}"
  ensure
    io.close if io && !io.closed?
  end
end

def extract_config(file_path)
  begin
    unless File.exist?(file_path)
      raise LoadError, "Could not load module from #{file_path}"
    end

    # Load the file in a clean context
    load file_path

    unless defined?(config)
      raise NameError, "Function 'config' not found in module #{file_path}"
    end

    config()
  rescue NameError => e
    raise "Error accessing config: #{e.message}"
  rescue => e
    raise "Error processing config file: #{e.message}"
  end
end

# Main execution block
begin
  if ARGV.empty?
    raise 'Error: No file path provided'
  end

  file_path = ARGV[0]
  
  unless File.exist?(file_path)
    raise "Error: File not found: #{file_path}"
  end
  
  unless File.readable?(file_path)
    raise "Error: File is not readable: #{file_path}"
  end

  # Extract and send config
  config = extract_config(file_path)
  send_message(config)
  
  exit(0)
end