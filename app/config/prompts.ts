export const RAG_TEMPLATE = `
Question: {question}

<CONTEXT>
{context}
</CONTEXT>

Use only the information within the <CONTEXT> block to answer the question.  If you are unable to provide an answer based on this information, say you don't know.
  
Answer:  `;
