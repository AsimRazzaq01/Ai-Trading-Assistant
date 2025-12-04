# backend/app/core/utils.py

def capitalize_name(name: str | None) -> str | None:
    """
    Capitalize a name properly (title case).
    Converts "john doe" to "John Doe", "MARY JANE" to "Mary Jane", etc.
    
    Args:
        name: The name string to capitalize, or None
        
    Returns:
        The capitalized name string, or None if input is None/empty
    """
    if not name or not name.strip():
        return name
    
    # Split by spaces and capitalize each word
    words = name.strip().split()
    capitalized_words = []
    
    for word in words:
        if word:
            # Convert to title case (first letter uppercase, rest lowercase)
            capitalized_words.append(word.capitalize())
    
    return ' '.join(capitalized_words)

