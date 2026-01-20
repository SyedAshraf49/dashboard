import mysql.connector
from mysql.connector import pooling
from config import Config
import bcrypt

class Database:
    _connection_pool = None
    
    @classmethod
    def initialize_pool(cls):
        """Initialize MySQL connection pool"""
        try:
            cls._connection_pool = pooling.MySQLConnectionPool(
                pool_name="dashboard_pool",
                pool_size=5,
                pool_reset_session=True,
                host=Config.MYSQL_HOST,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DATABASE,
                port=Config.MYSQL_PORT,
                autocommit=False
            )
            print("✓ Database connection pool initialized successfully")
            return True
        except mysql.connector.Error as err:
            print(f"✗ Error initializing database pool: {err}")
            return False
    
    @classmethod
    def get_connection(cls):
        """Get a connection from the pool"""
        if cls._connection_pool is None:
            cls.initialize_pool()
        try:
            return cls._connection_pool.get_connection()
        except mysql.connector.Error as err:
            print(f"Error getting connection: {err}")
            return None
    
    @classmethod
    def execute_query(cls, query, params=None, fetch=False, fetch_one=False):
        """Execute a query with proper error handling"""
        connection = None
        cursor = None
        try:
            connection = cls.get_connection()
            if connection is None:
                return None
            
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            
            if fetch_one:
                result = cursor.fetchone()
            elif fetch:
                result = cursor.fetchall()
            else:
                connection.commit()
                result = cursor.lastrowid or True
            
            return result
        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            if connection:
                connection.rollback()
            return None
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
    
    @classmethod
    def initialize_database(cls):
        """Initialize database with default users if not exists"""
        try:
            # Check if users exist
            query = "SELECT COUNT(*) as count FROM users"
            result = cls.execute_query(query, fetch_one=True)
            
            if result and result['count'] == 0:
                # Insert default users with hashed passwords
                users = [
                    ('admin1', 'Admin@123', 'admin', 'Admin One', 'admin1@dashboard.com'),
                    ('admin2', 'Admin@456', 'admin', 'Admin Two', 'admin2@dashboard.com'),
                    ('user1', 'User@123', 'user', 'User One', 'user1@dashboard.com'),
                    ('user2', 'User@456', 'user', 'User Two', 'user2@dashboard.com'),
                    ('user3', 'User@789', 'user', 'User Three', 'user3@dashboard.com'),
                    ('user4', 'User@012', 'user', 'User Four', 'user4@dashboard.com')
                ]
                
                for username, password, role, full_name, email in users:
                    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    insert_query = """
                        INSERT INTO users (username, password_hash, role, full_name, email)
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    cls.execute_query(insert_query, (username, password_hash, role, full_name, email))
                
                print("✓ Default users created successfully")
            else:
                print("✓ Users already exist in database")
            
            return True
        except Exception as e:
            print(f"✗ Error initializing database: {e}")
            return False