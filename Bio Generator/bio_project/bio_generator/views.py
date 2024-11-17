import os
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import google.generativeai as genai
from dotenv import load_dotenv

# Configure Gemini
load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
gemini_model = genai.GenerativeModel('gemini-pro')

@api_view(['POST'])
def generate_bio(request):
    """
    Generates a dating profile bio using Gemini model
    Returns error if model fails to process
    """
    try:
        # Get data from the request
        data = request.data
        
        career = data.get('career', '')
        interests = data.get('interests', [])
        personality_traits = data.get('personalityTraits', [])
        relationship_goals = data.get('relationshipGoals', [])

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
        
        Create a poetic, rhythmic, engaging and authentic dating profile bio for someone with these characteristics:
        Career: {career}
        Interests: {', '.join(interests)}
        Personality Traits: {', '.join(personality_traits)}
        Relationship Goals: {', '.join(relationship_goals)}
        
        Transform this profile bio in a poetic, rethmic, engaging and authentic version for our DinnerTonight user while maintaining the information and personality 
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
            bio = gemini_response.text.strip()
            return Response({"bio": bio}, status=status.HTTP_200_OK)
            
        except Exception as gemini_error:
            return Response(
                {"error": str(gemini_error)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def health_check(request):
    """Simple endpoint to verify API is running"""
    return Response({"status": "Healthy"}, status=status.HTTP_200_OK)
