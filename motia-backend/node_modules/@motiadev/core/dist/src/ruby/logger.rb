require 'json'
require 'time'

class CustomLogger
  def initialize(trace_id, flows, sender)
    @trace_id = trace_id
    @flows = flows
    @sender = sender
  end

  def log(level, message, args = nil)
    # Handle message formatting consistently with Python/Node
    if message.is_a?(String) && message.strip.start_with?('{', '[')
      begin
        message = JSON.parse(message)
      rescue JSON::ParserError
        # Leave message as is if not valid JSON
      end
    end

    # Construct the log entry to match Python/Node format
    log_entry = {
      level: level,
      time: (Time.now.to_f * 1000).to_i,  # Milliseconds since epoch to match Node
      traceId: @trace_id,
      flows: @flows,
      msg: message
    }

    # Handle additional args consistently with Python/Node
    if args
      case args
      when OpenStruct
        log_entry.merge!(args.to_h)
      when Hash
        log_entry.merge!(args)
      else
        log_entry[:data] = args
      end
    end

    @sender.send_no_wait('log', log_entry)
  end

  def info(message, args = nil)
    log('info', message, args)
  end

  def error(message, args = nil)
    log('error', message, args)
  end

  def debug(message, args = nil)
    log('debug', message, args)
  end

  def warn(message, args = nil)
    log('warn', message, args)
  end
end