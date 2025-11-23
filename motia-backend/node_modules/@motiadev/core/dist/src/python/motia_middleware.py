from typing import Any, Callable
from functools import reduce
from motia_context import Context

def compose_middleware(*middlewares):
    """Compose multiple middleware functions into a single middleware"""
    def compose_two(f: Callable, g: Callable) -> Callable:
        async def composed(data: Any, context: Context, next_fn: Callable):
            async def wrapped_next(d=data):
                return await g(d, context, next_fn)
            return await f(data, context, wrapped_next)
        return composed

    if not middlewares:
        return lambda data, context, next_fn: next_fn()
    
    return reduce(compose_two, middlewares)