from flask import Blueprint, request, jsonify, session
from database import Database
from auth import login_required

api_bp = Blueprint('api', __name__)

# Contractor List Routes
@api_bp.route('/contractor-list', methods=['GET'])
@login_required
def get_contractor_list():
    """Get all contractor list records"""
    try:
        query = """
            SELECT id, sno, efile, contractor, description, value,
                   start_date, end_date, duration, file_name, file_base64, file_type
            FROM contractor_list
            ORDER BY id DESC
        """
        records = Database.execute_query(query, fetch=True)
        return jsonify(records or []), 200
    except Exception as e:
        print(f"Error fetching contractor list: {e}")
        return jsonify({'error': 'Failed to fetch data'}), 500

@api_bp.route('/contractor-list', methods=['POST'])
@login_required
def save_contractor_list():
    """Save contractor list records"""
    try:
        data = request.get_json()
        records = data.get('records', [])
        
        # Delete existing records
        Database.execute_query("DELETE FROM contractor_list")
        
        # Insert new records
        insert_query = """
            INSERT INTO contractor_list 
            (sno, efile, contractor, description, value, start_date, end_date, 
             duration, file_name, file_base64, file_type, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        for record in records:
            params = (
                record.get('sno'), record.get('efile'), record.get('contractor'),
                record.get('description'), record.get('value'), record.get('startDate'),
                record.get('endDate'), record.get('duration'), record.get('fileName'),
                record.get('fileBase64'), record.get('fileType'), session['user_id']
            )
            Database.execute_query(insert_query, params)
        
        return jsonify({'success': True, 'message': 'Data saved successfully'}), 200
    except Exception as e:
        print(f"Error saving contractor list: {e}")
        return jsonify({'error': 'Failed to save data'}), 500

# Bill Tracker Routes
@api_bp.route('/bill-tracker', methods=['GET'])
@login_required
def get_bill_tracker():
    """Get all bill tracker records"""
    try:
        query = """
            SELECT id, sno, efile, contractor, approved_date, approved_amount,
                   bill_frequency, bill_date, bill_due_date, bill_paid_date,
                   paid_amount, file_name, file_base64, file_type
            FROM bill_tracker
            ORDER BY id DESC
        """
        records = Database.execute_query(query, fetch=True)
        return jsonify(records or []), 200
    except Exception as e:
        print(f"Error fetching bill tracker: {e}")
        return jsonify({'error': 'Failed to fetch data'}), 500

@api_bp.route('/bill-tracker', methods=['POST'])
@login_required
def save_bill_tracker():
    """Save bill tracker records"""
    try:
        data = request.get_json()
        records = data.get('records', [])
        
        # Delete existing records
        Database.execute_query("DELETE FROM bill_tracker")
        
        # Insert new records
        insert_query = """
            INSERT INTO bill_tracker 
            (sno, efile, contractor, approved_date, approved_amount, bill_frequency,
             bill_date, bill_due_date, bill_paid_date, paid_amount,
             file_name, file_base64, file_type, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        for record in records:
            params = (
                record.get('sno'), record.get('efile'), record.get('contractor'),
                record.get('approvedDate'), record.get('approvedAmount'),
                record.get('billFrequency'), record.get('billDate'),
                record.get('billDueDate'), record.get('billPaidDate'),
                record.get('paidAmount'), record.get('fileName'),
                record.get('fileBase64'), record.get('fileType'), session['user_id']
            )
            Database.execute_query(insert_query, params)
        
        return jsonify({'success': True, 'message': 'Data saved successfully'}), 200
    except Exception as e:
        print(f"Error saving bill tracker: {e}")
        return jsonify({'error': 'Failed to save data'}), 500

# EPBG Routes
@api_bp.route('/epbg', methods=['GET'])
@login_required
def get_epbg():
    """Get all EPBG records"""
    try:
        query = """
            SELECT id, sno, contractor, po_no, bg_no, bg_date, bg_amount,
                   bg_validity, gem_bid, ref_efile, file_name, file_base64, file_type
            FROM epbg
            ORDER BY id DESC
        """
        records = Database.execute_query(query, fetch=True)
        return jsonify(records or []), 200
    except Exception as e:
        print(f"Error fetching EPBG: {e}")
        return jsonify({'error': 'Failed to fetch data'}), 500

@api_bp.route('/epbg', methods=['POST'])
@login_required
def save_epbg():
    """Save EPBG records"""
    try:
        data = request.get_json()
        records = data.get('records', [])
        
        # Delete existing records
        Database.execute_query("DELETE FROM epbg")
        
        # Insert new records
        insert_query = """
            INSERT INTO epbg 
            (sno, contractor, po_no, bg_no, bg_date, bg_amount, bg_validity,
             gem_bid, ref_efile, file_name, file_base64, file_type, created_by)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        for record in records:
            params = (
                record.get('sno'), record.get('contractor'), record.get('poNo'),
                record.get('bgNo'), record.get('bgDate'), record.get('bgAmount'),
                record.get('bgValidity'), record.get('gemBid'), record.get('refEfile'),
                record.get('fileName'), record.get('fileBase64'), record.get('fileType'),
                session['user_id']
            )
            Database.execute_query(insert_query, params)
        
        return jsonify({'success': True, 'message': 'Data saved successfully'}), 200
    except Exception as e:
        print(f"Error saving EPBG: {e}")
        return jsonify({'error': 'Failed to save data'}), 500