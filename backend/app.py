from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from flask_mysqldb import MySQL
import datetime
import hashlib
import MySQLdb

app = Flask('__name__')

CORS(app)




#MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'twp'

mysql = MySQL(app)


def hash_password(password):
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    return hashed_password

def verify_password(plain_password, hashed_password):
    hashed_plain_password = hashlib.sha256(plain_password.encode()).hexdigest()
    # Compare the hashed plain password with the stored hashed password
    return hashed_plain_password == hashed_password

def authenticate_user(email, password):
    
    cur = mysql.connection.cursor()
    cur.execute(f"SELECT email, password, user_type FROM users WHERE email = '{email}'")
    tempUser = cur.fetchone()
    cur.close()

    if tempUser and verify_password(password, tempUser[1]):
        # return {'email': email}
        return tempUser
    else:
        return None

def generate_session_id(email):
    session_data = f"{email}-{datetime.datetime.now()}"
    session_id = hashlib.sha256(session_data.encode()).hexdigest()
    return session_id


def add_session(email, new_session_id):
    try:
        cursor = mysql.connection.cursor()

        # Insert a new session record
        insert_query = "INSERT INTO sessions (user_email, session_id, created_at , status) VALUES (%s, %s, %s, %s)"
        current_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute(insert_query, (email, new_session_id, current_time, 'active'))
        mysql.connection.commit()
        print(f"New session inserted for user {email} with session ID {new_session_id}.")

        # Close the cursor
        cursor.close()

    except MySQLdb.Error as error:
        print(f"Error during add_session: {str(error)}")
        return False


def check_sessions(session_id_cookie):
    try:
        cursor = mysql.connection.cursor()

        query = "SELECT user_email FROM sessions WHERE session_id = %s AND status = 'active'"
        
        cursor.execute(query, ( session_id_cookie, ))
        
        result = cursor.fetchone()
        
        if result:
            user_email = result[0]
            print(f"for {user_email} Session ID {session_id_cookie} is valid and status is active.")
            return user_email
        else:
            print(f"Session ID {session_id_cookie} is not valid for user.")
            return None
    
    except MySQLdb.Error as error:
        print(f"Error during checking session: {str(error)}")
        return None

def get_user_type_from_email(user_email):
    try:
        # Establish a connection to the database
        cursor = mysql.connection.cursor()

        # Query to retrieve the user type associated with the user email
        query = "SELECT user_type FROM users WHERE email = %s"

        # Execute the SQL query with the user email as a parameter
        cursor.execute(query, (user_email,))
        
        # Fetch the result
        result = cursor.fetchone()
        
        # Check if a matching user email was found
        if result:
            user_type = result[0]
            return user_type
        else:
            return None
    
    except MySQLdb.Error as error:
        print(f"Error getting user type from email: {str(error)}")
        return None
    finally:
        cursor.close()



# //////////////////////////API Routes//////////////////////////////////////////////

@app.route('/', methods=[ 'GET' ])
@cross_origin(supports_credentials=True)
def home():
    # return "home"
    session_id_cookie = request.cookies.get('app_session')
    print(f"Session ID {session_id_cookie} is found")
    if session_id_cookie:
        user_email = check_sessions(session_id_cookie)
        if user_email:
            user_type = get_user_type_from_email(user_email) 
            if user_type == 'student':
                # Student is accessing the route
                response = make_response(jsonify({'status': 'success', 'user_type': user_type}), 200)
                return response
            elif user_type == 'teacher':
                # Teacher is accessing the route
                response = make_response(jsonify({'status': 'success', 'user_type': user_type}), 200)
                return response
            else:
                # User is not a known, return error response
                response = make_response(jsonify({'status': 'error', 'message': 'User Type unknown!!!'}))
                return response
        else:
            # user_email ID not valid 
            response = make_response(jsonify({'status': 'error', 'message': 'user email from session not found'}))
            return response
    else:
        # Session cookie not found, return error response
        response = make_response(jsonify({'status': 'error', 'message': 'Session cookie not found'}))
        return response


@app.route('/login', methods=[ 'POST' ])
@cross_origin(supports_credentials=True)
def login():
    if request.method == 'POST':
        try:
            data = request.get_json()  # Get JSON data from the request
            email = data.get('email')
            password = data.get('password')

            user = authenticate_user(email, password)

            if user:
                user_type = user[2]
                new_session_id = generate_session_id(email)
                expiry_date = datetime.datetime.now() + datetime.timedelta(days=126)
                
                response = make_response(jsonify({'status': 'success', 'user_type': user_type,'message': 'User logged in and session created successfully'}), 200)
                response.set_cookie('app_session', new_session_id,expires=expiry_date)

                add_session(email, new_session_id)

                return response
            else:
                response = {'status': 'no success', 'message': 'User not found'}
                return jsonify(response), 404

        except Exception as e:
            # Log the error for debugging purposes
            print(f"Error during Logging in: {str(e)}")

            response = make_response(jsonify({'status': 'error', 'message': 'An error occurred during Logging in'}), 500)
            return response


@app.route('/register', methods = ['GET', 'POST'])
def register():
     if request.method == 'POST':
        try:
            #THIS DID NOT WORK
            # name = request.form['name']
            # matriculation = request.form['matriculation']
            # email = request.form['email']
            # password = request.form['password']

            data = request.get_json()  # Get JSON data from the request
            name = data.get('name')
            matriculation = data.get('matriculation')
            email = data.get('email')
            password = data.get('password')

            hashed_password = hash_password(password)

            cur = mysql.connection.cursor()
            cur.execute("INSERT INTO users (name, matriculation, email, password) VALUES (%s, %s, %s, %s)",
                        (name, matriculation, email, hashed_password))
            mysql.connection.commit()
            cur.close()

            response = {'status': 'success', 'message': 'User registered successfully'}
            return jsonify(response), 200

        except Exception as e:
            # Log the error for debugging purposes
            print(f"Error during registration: {str(e)}")

            response = {'status': 'error', 'message': 'An error occurred during registration'}
            return jsonify(response), 500


@app.route('/logout', methods=['GET'])
@cross_origin(supports_credentials=True)
def logout():
    try:
        # Update the session status in the database to 'inactive'
        session_id_cookie = request.cookies.get('app_session')
        if session_id_cookie:
            try:
                cursor = mysql.connection.cursor()
                update_query = "UPDATE sessions SET status = 'inactive' WHERE session_id = %s"
                cursor.execute(update_query, (session_id_cookie,))
                mysql.connection.commit()
                cursor.close()
            except MySQLdb.Error as error:
                print(f"Error during inactivating session id: {str(error)}")
                response = make_response(jsonify({'status': 'error', 'message': 'An error occurred during inactivating session id'}), 500)
                return response
        # Clear the session-related data in the client-side cookie
        response = make_response(jsonify({'status': 'success', 'message': 'User logged out successfully'}), 200)
        response.set_cookie('app_session', '', expires=0)  # Clear the session cookie
        return response

    except Exception as e:
        print(f"Error during logout: {str(e)}")
        response = make_response(jsonify({'status': 'error', 'message': 'An error occurred during logout'}), 500)
        return response


@app.after_request
def after_request(response):
    # Log CORS-related headers for debugging
    print(response.headers)
    return response


if __name__ == '__main__':
        # app.run(debug=True)
        app.run(debug=True, host='localhost', port=3001)




