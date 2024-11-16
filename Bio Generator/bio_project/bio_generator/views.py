import re
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import os
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import google.generativeai as genai
from dotenv import load_dotenv

# Load the model and tokenizer once during the app startup
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Configure Gemini
load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
gemini_model = genai.GenerativeModel('gemini-pro')

try:
    # Initialize model and tokenizer
    tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-large")
    model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-large")
    model = model.to(device)
    model.eval()
    print("Model and tokenizer successfully loaded.")
    
except Exception as e:
    print(f"Error loading model: {e}")
    tokenizer = None
    model = None

@api_view(['POST'])
def generate_bio(request):
    """
    Generates a dating profile bio using a two-step process:
    1. Initial generation with FLAN-T5 model
    2. Enhancement with Gemini model for more poetic and engaging content
    Returns error if models fail to initialize or process
    """
    if not tokenizer or not model:
        return Response(
            {"error": "The AI model failed to initialize. Please check server logs for details."}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        # Get data from the request
        data = request.data
        
        career = data.get('career', '')
        interests = data.get('interests', [])
        personality_traits = data.get('personalityTraits', [])
        relationship_goals = data.get('relationshipGoals', [])

        # Create a fun and engaging prompt for dating profile bio generation
        prompt = f"Write a fun, light-hearted,poetic and engaging dating profile bio for someone who loves life! They're a {career} with a passion for {', '.join(interests)}. Their friends would describe them as {', '.join(personality_traits)}. When it comes to relationships, they're open to {', '.join(relationship_goals)}. Make it playful and authentic!"

        # Tokenize and generate initial bio
        inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model.generate(
                inputs["input_ids"],
                max_length=150,
                num_beams=5,
                temperature=1.0,
                top_k=50,
                top_p=0.95,
                no_repeat_ngram_size=3,
                do_sample=True,
                repetition_penalty=1.2
            )
        
        initial_bio = tokenizer.decode(outputs[0], skip_special_tokens=True)
        initial_bio = ' '.join(initial_bio.split())
        initial_bio = initial_bio.strip()

        # Pass to Gemini for poetic enhancement
        reference_bios = """
        Here are some example bios for reference:
        - Globe-trotting architect with a passion for spicy food and sustainable design. Seeking a fellow adventurer who can appreciate a good biryani and a thought-provoking conversation.
        - Introverted writer with a love for classic literature and indie coffee shops. Looking for someone who can match my wit and charm over a cup of chai and a deep discussion about our favorite novels.
        - Energetic entrepreneur with a passion for fitness and outdoor adventures. Seeking a partner who can keep up with my active lifestyle and shares my love for hiking, biking, and trying new things.
        - Soulful musician with a heart for social justice and a love for live music. Looking for a kind and compassionate partner who enjoys jamming out at concerts and making a difference in the world.
        - Software engineer by day, gamer by night. I'm equally comfortable debugging code and exploring virtual worlds. Seeking a partner who can appreciate my geeky side and isn't afraid to challenge me to a board game showdown.
        """
        
        gemini_prompt = f"""Using these bios as reference for style and tone:
        {reference_bios}
        
        Transform this profile bio in a poetic, rethmic, engaging and authentic version for our DinnerTonight user while maintaining the information and personality: {initial_bio}
        Generate a bio of 30 to 45 words, maximum 3 lines, that captures their essence in a natural, flowing way and smoother."""
        
        try:
            gemini_response = gemini_model.generate_content(
                gemini_prompt,
                safety_settings=[
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            )
            poetic_bio = gemini_response.text.strip()
        except Exception as gemini_error:
            # Fallback to initial bio if Gemini enhancement fails
            poetic_bio = initial_bio

        return Response({"bio": poetic_bio}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def health_check(request):
    """Simple endpoint to verify API is running"""
    return Response({"status": "Healthy"}, status=status.HTTP_200_OK)
