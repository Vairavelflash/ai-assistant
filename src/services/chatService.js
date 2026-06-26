

export async function streamChat(conversationId,message,onChunk) {
    const response = await fetch("/api/chat",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            conversationId,
            message
        })
    })

    const reader = response.body.getReader();

    const decoder = new TextDecoder();

    while(true){
        const {done,value} =  await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value)

        onChunk(chunk)
    }
}