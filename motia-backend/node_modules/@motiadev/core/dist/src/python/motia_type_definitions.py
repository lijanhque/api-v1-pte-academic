from typing import TypeVar, Callable, Coroutine, Union, Dict, List, Optional
from types import SimpleNamespace

# Generic type for JSON schema validation
T = TypeVar('T')

# Custom types
JsonSchema = Dict[str, any]
ValidationResult = Dict[str, Union[bool, Dict, str]]
HandlerResult = Optional[Dict[str, any]]
HandlerFunction = Callable[..., Coroutine[any, any, HandlerResult]]

class FlowConfig(SimpleNamespace):
    type: str
    input: Optional[JsonSchema]
    bodySchema: Optional[JsonSchema]

class HandlerArgs(SimpleNamespace):
    traceId: str
    flows: List[str]
    data: Union[Dict, SimpleNamespace]
    contextInFirstArg: bool

class ApiResponse:
    def __init__(
        self,
        status: int,
        body: Dict[str, any],
        headers: Optional[Dict[str, str]] = None
    ):
        self.status = status
        self.body = body
        self.headers = headers or {'Content-Type': 'application/json'} 