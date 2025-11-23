class DotDict(dict):
    def __getattr__(self, key):
        try:
            value = self[key]
            return DotDict(value) if isinstance(value, dict) else value
        except KeyError:
            raise AttributeError(f"No such attribute: {key}")

    def __setattr__(self, key, value):
        self[key] = value

    def __delattr__(self, key):
        try:
            del self[key]
        except KeyError:
            raise AttributeError(f"No such attribute: {key}")