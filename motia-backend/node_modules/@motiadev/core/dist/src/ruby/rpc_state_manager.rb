class RpcStateManager
  def initialize(sender)
    @sender = sender
  end

  # Support hash-like access with [:method_name] syntax
  def [](method_name)
    case method_name.to_sym
    when :get
      ->(trace_id, key) { get(trace_id, key) }
    when :set
      ->(trace_id, key, value) { set(trace_id, key, value) }
    when :delete
      ->(trace_id, key) { delete(trace_id, key) }
    when :clear
      ->(trace_id) { clear(trace_id) }
    else
      raise NoMethodError, "undefined method `#{method_name}' for #{self.class}"
    end
  end

  def get(trace_id, key)
    # Return promise to match Python/Node behavior
    @sender.send('state.get', { traceId: trace_id, key: key })
  end

  def set(trace_id, key, value)
    # Return promise to match Python/Node behavior
    @sender.send('state.set', { traceId: trace_id, key: key, value: value })
  end

  def delete(trace_id, key)
    # Return promise to match Python/Node behavior
    @sender.send('state.delete', { traceId: trace_id, key: key })
  end

  def clear(trace_id)
    # Return promise to match Python/Node behavior
    @sender.send('state.clear', { traceId: trace_id })
  end
end
