async def send_email_mock(payload: dict) -> dict:
    return {"status": "sent_mock", "payload": payload}


async def create_calendar_event_mock(payload: dict) -> dict:
    return {"status": "created_mock", "payload": payload}

