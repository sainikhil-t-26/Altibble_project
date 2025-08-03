from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import numpy as np
import nltk
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
from sentence_transformers import SentenceTransformer
import torch
import json
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Initialize models
question_generator = None
sentiment_analyzer = None
sentence_model = None

def load_models():
    """Load AI models for question generation and analysis"""
    global question_generator, sentiment_analyzer, sentence_model
    
    try:
        # Initialize question generation pipeline
        question_generator = pipeline(
            "text2text-generation",
            model="google/flan-t5-base",
            device=0 if torch.cuda.is_available() else -1
        )
        
        # Initialize sentiment analysis
        sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            device=0 if torch.cuda.is_available() else -1
        )
        
        # Initialize sentence embeddings
        sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        print("✅ AI models loaded successfully")
    except Exception as e:
        print(f"⚠️ Error loading models: {e}")
        print("Running with fallback methods")

# Load models on startup
load_models()

# Question templates for different categories
QUESTION_TEMPLATES = {
    'ingredients': [
        "What are the main ingredients in {product_name}?",
        "Are there any artificial preservatives or additives in {product_name}?",
        "What is the source of the primary ingredients in {product_name}?",
        "Are the ingredients in {product_name} organic or conventionally grown?",
        "What allergens are present in {product_name}?"
    ],
    'manufacturing': [
        "Where is {product_name} manufactured?",
        "What are the manufacturing processes used for {product_name}?",
        "Are there any quality control measures in place for {product_name}?",
        "What certifications does the manufacturing facility have?",
        "How is {product_name} packaged and stored?"
    ],
    'environmental': [
        "What is the carbon footprint of producing {product_name}?",
        "Are the packaging materials for {product_name} recyclable?",
        "What environmental impact does {product_name} have?",
        "Are sustainable practices used in the production of {product_name}?",
        "What waste management practices are in place for {product_name}?"
    ],
    'social': [
        "What are the labor practices in the supply chain for {product_name}?",
        "Are fair trade principles followed for {product_name}?",
        "What is the company's policy on worker safety for {product_name}?",
        "Are there any community impact initiatives related to {product_name}?",
        "What is the company's stance on diversity and inclusion?"
    ],
    'health': [
        "What are the nutritional benefits of {product_name}?",
        "Are there any health risks associated with {product_name}?",
        "What clinical studies support the health claims of {product_name}?",
        "How does {product_name} compare to similar products in terms of health benefits?",
        "What is the recommended daily intake for {product_name}?"
    ]
}

def generate_questions_ai(product_info, context=None, question_type='initial'):
    """Generate questions using AI models"""
    questions = []
    
    try:
        if question_generator:
            # Create context for question generation
            context_text = f"Product: {product_info.get('name', '')} "
            context_text += f"Category: {product_info.get('category', '')} "
            context_text += f"Manufacturer: {product_info.get('manufacturer', '')} "
            
            if product_info.get('description'):
                context_text += f"Description: {product_info['description']} "
            
            if product_info.get('ingredients'):
                context_text += f"Ingredients: {product_info['ingredients']} "
            
            # Generate questions for different categories
            for category, templates in QUESTION_TEMPLATES.items():
                for template in templates[:2]:  # Limit to 2 questions per category
                    prompt = f"Generate a transparency question about {category} for: {context_text}"
                    
                    try:
                        response = question_generator(prompt, max_length=100, num_return_sequences=1)
                        question_text = response[0]['generated_text'].strip()
                        
                        # Clean up the generated text
                        question_text = re.sub(r'^Question:\s*', '', question_text)
                        question_text = re.sub(r'^Q:\s*', '', question_text)
                        
                        if len(question_text) > 10:  # Ensure meaningful question
                            questions.append({
                                'text': question_text,
                                'type': 'TEXT',
                                'category': category,
                                'isRequired': category in ['ingredients', 'manufacturing']
                            })
                    except Exception as e:
                        print(f"Error generating question for {category}: {e}")
                        continue
    except Exception as e:
        print(f"AI question generation failed: {e}")
    
    return questions

def generate_questions_fallback(product_info, context=None, question_type='initial'):
    """Fallback method for question generation using templates"""
    questions = []
    
    product_name = product_info.get('name', 'this product')
    category = product_info.get('category', '').lower()
    
    # Select relevant categories based on product category
    relevant_categories = ['ingredients', 'manufacturing']
    
    if 'food' in category or 'beverage' in category:
        relevant_categories.extend(['health', 'environmental'])
    elif 'cosmetic' in category or 'beauty' in category:
        relevant_categories.extend(['health', 'environmental'])
    elif 'clothing' in category or 'textile' in category:
        relevant_categories.extend(['social', 'environmental'])
    else:
        relevant_categories.extend(['environmental', 'social'])
    
    # Generate questions from templates
    for cat in relevant_categories:
        if cat in QUESTION_TEMPLATES:
            for template in QUESTION_TEMPLATES[cat][:2]:
                question_text = template.format(product_name=product_name)
                questions.append({
                    'text': question_text,
                    'type': 'TEXT',
                    'category': cat,
                    'isRequired': cat in ['ingredients', 'manufacturing']
                })
    
    return questions

def calculate_transparency_score_ai(product_info, questions_data):
    """Calculate transparency score using AI analysis"""
    scores = {
        'transparency': 0.0,
        'health': 0.0,
        'environmental': 0.0,
        'social': 0.0
    }
    
    try:
        if sentiment_analyzer and sentence_model:
            total_score = 0
            category_scores = {
                'health': [],
                'environmental': [],
                'social': [],
                'ingredients': [],
                'manufacturing': []
            }
            
            # Analyze each question and answer
            for question_data in questions_data:
                question_text = question_data.get('text', '')
                answers = question_data.get('answers', [])
                
                if answers:
                    answer_text = answers[0].get('value', '')
                    
                    # Analyze sentiment of the answer
                    try:
                        sentiment_result = sentiment_analyzer(answer_text[:512])  # Limit length
                        sentiment_score = 0.5  # Neutral baseline
                        
                        if sentiment_result[0]['label'] == 'POSITIVE':
                            sentiment_score = 0.8
                        elif sentiment_result[0]['label'] == 'NEGATIVE':
                            sentiment_score = 0.2
                        
                        # Calculate answer completeness
                        completeness_score = min(len(answer_text) / 50, 1.0)  # Normalize by expected length
                        
                        # Combined score for this answer
                        answer_score = (sentiment_score + completeness_score) / 2
                        total_score += answer_score
                        
                        # Categorize by question category
                        category = question_data.get('category', 'general')
                        if category in category_scores:
                            category_scores[category].append(answer_score)
                    
                    except Exception as e:
                        print(f"Error analyzing answer: {e}")
                        continue
            
            # Calculate overall transparency score
            if total_score > 0:
                scores['transparency'] = min(total_score / len(questions_data), 1.0)
            
            # Calculate category-specific scores
            for category, score_list in category_scores.items():
                if score_list:
                    if category in ['health', 'ingredients']:
                        scores['health'] = np.mean(score_list)
                    elif category in ['environmental']:
                        scores['environmental'] = np.mean(score_list)
                    elif category in ['social', 'manufacturing']:
                        scores['social'] = np.mean(score_list)
    
    except Exception as e:
        print(f"AI scoring failed: {e}")
    
    return scores

def calculate_transparency_score_fallback(product_info, questions_data):
    """Fallback method for transparency scoring"""
    scores = {
        'transparency': 0.5,  # Default neutral score
        'health': 0.5,
        'environmental': 0.5,
        'social': 0.5
    }
    
    try:
        total_answers = 0
        answered_questions = 0
        
        for question_data in questions_data:
            answers = question_data.get('answers', [])
            if answers and answers[0].get('value', '').strip():
                answered_questions += 1
                # Simple scoring based on answer length and content
                answer_text = answers[0]['value']
                answer_score = min(len(answer_text) / 100, 1.0)  # Normalize
                total_answers += answer_score
        
        if len(questions_data) > 0:
            scores['transparency'] = total_answers / len(questions_data)
        
        # Simple category scoring
        category_counts = {}
        for question_data in questions_data:
            category = question_data.get('category', 'general')
            category_counts[category] = category_counts.get(category, 0) + 1
        
        # Adjust category scores based on question distribution
        if 'health' in category_counts or 'ingredients' in category_counts:
            scores['health'] = 0.6
        if 'environmental' in category_counts:
            scores['environmental'] = 0.6
        if 'social' in category_counts or 'manufacturing' in category_counts:
            scores['social'] = 0.6
    
    except Exception as e:
        print(f"Fallback scoring failed: {e}")
    
    return scores

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': {
            'question_generator': question_generator is not None,
            'sentiment_analyzer': sentiment_analyzer is not None,
            'sentence_model': sentence_model is not None
        },
        'gpu_available': torch.cuda.is_available()
    })

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    """Generate questions for a product"""
    try:
        data = request.get_json()
        product_info = data.get('product', {})
        context = data.get('context')
        question_type = data.get('type', 'initial')
        
        if not product_info:
            return jsonify({
                'success': False,
                'message': 'Product information is required'
            }), 400
        
        # Try AI generation first, fallback to templates
        questions = generate_questions_ai(product_info, context, question_type)
        
        if not questions:
            questions = generate_questions_fallback(product_info, context, question_type)
        
        return jsonify({
            'success': True,
            'questions': questions,
            'count': len(questions)
        })
    
    except Exception as e:
        print(f"Error generating questions: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to generate questions',
            'error': str(e)
        }), 500

@app.route('/transparency-score', methods=['POST'])
def calculate_transparency_score():
    """Calculate transparency score for a product"""
    try:
        data = request.get_json()
        product_info = data.get('product', {})
        questions_data = data.get('questions', [])
        
        if not product_info:
            return jsonify({
                'success': False,
                'message': 'Product information is required'
            }), 400
        
        # Try AI scoring first, fallback to simple scoring
        scores = calculate_transparency_score_ai(product_info, questions_data)
        
        # If AI scoring failed, use fallback
        if all(score == 0.0 for score in scores.values()):
            scores = calculate_transparency_score_fallback(product_info, questions_data)
        
        return jsonify({
            'success': True,
            'scores': scores
        })
    
    except Exception as e:
        print(f"Error calculating transparency score: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to calculate transparency score',
            'error': str(e)
        }), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'message': 'Altibbe AI Service',
        'version': '1.0.0',
        'endpoints': [
            '/health',
            '/generate-questions',
            '/transparency-score'
        ]
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"🚀 Starting AI Service on port {port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"🤖 Models loaded: {question_generator is not None}")
    
    app.run(host='0.0.0.0', port=port, debug=debug) 
 