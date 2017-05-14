import json
import bottle
from bottle import route, run, request, abort
from bottle_rest import json_to_params, json_to_data
from pymongo import MongoClient
from bson.objectid import ObjectId
import requests
import base64
import json

connection = MongoClient('localhost', 27017)
db = connection.yojee
wallet = db.wallet
token = db.token
txn = db.txn

@bottle.error(405)
def method_not_allowed(res):
    if request.method == 'OPTIONS':
        new_res = bottle.HTTPResponse()
        new_res.set_header('Access-Control-Allow-Origin', '*')
        new_res.set_header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
        new_res.set_header('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token')
        return new_res
    res.headers['Allow'] += ', OPTIONS'
    return request.app.default_error_handler(res)

@bottle.hook('after_request')
def enableCORSAfterRequestHook():
    bottle.response.set_header('Access-Control-Allow-Origin', '*')
    bottle.response.set_header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    bottle.response.set_header('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token')

@route('/authenticate', method=['POST'])
@json_to_data
def authenticate(data):
    if data is None:
        raise ValueError
    username = data['username']
    password = data['password']
    row = wallet.find_one({'username' : username, 'password' : password})
    if row is None:
        return {'success': False, 'message':'login failed'}
    else:
        token_id = token.insert_one({'userid': str(row['_id'])}).inserted_id
        return {'success': True, 'userid': str(row['_id']), 'token': str(token_id)}

@route('/<userid>/balance', method=['GET'])
def balance(userid):
    tokenObj = token.find_one({'_id' : ObjectId(request.query['token'])})
    if tokenObj is None:
        return {'success': False, 'message': 'Invalid token'}
    if tokenObj['userid'] != userid:
        return {'success': False, 'message': 'Invalid token'}
    walletObj = wallet.find_one({'_id': ObjectId(userid)})
    if walletObj is None:
        return {'success': False, 'message': 'wallet not found'}
    return {'success': True, 'balance': walletObj['balance']}

@route('/<userid>/recharge', method=['POST'])
@json_to_data
def recharge(userid, data):
    tokenObj = token.find_one({'_id' : ObjectId(request.query['token'])})
    if tokenObj is None:
        return {'success': False, 'message': 'Invalid token'}
    if tokenObj['userid'] != userid:
        return {'success': False, 'message': 'Invalid token'}
    result = wallet.update_one({'_id': ObjectId(userid)}, {'$inc': {'balance': data['amount']}})
    walletObj = wallet.find_one({'_id': ObjectId(userid)})
    return {'success': True, 'balance': walletObj['balance']}

@route('/<userid>/transaction', method=['POST'])
@json_to_data
def transaction(userid, data):
    tokenObj = token.find_one({'_id' : ObjectId(request.query['token'])})
    if tokenObj is None:
        return {'success': False, 'message': 'Invalid token'}
    if tokenObj['userid'] != userid:
        return {'success': False, 'message': 'Invalid token'}
    walletObj = wallet.find_one({'_id': ObjectId(userid)})
    amount = data['amount']
    if amount < walletObj['balance']:
        walletAmount = amount
        txnAmount = 0
    else:
        walletAmount = walletObj['balance']
        txnAmount = amount - walletObj['balance']
    trans = {'userid': userid, 'walletAmount': walletAmount, 'txnAmount': txnAmount, 'txnCompleted': False}
    txn_id = txn.insert_one(trans).inserted_id
    if txnAmount != 0:
        url = 'https://app.sandbox.midtrans.com/snap/v1/transactions'
        data = {'transaction_details': {
                   'order_id': str(txn_id),
                   'gross_amount': int(txnAmount)
                   },
                 'credit_card': {
                    'secure': True
                   }
                }
        headers = {'Authorization': 'Basic ' + base64.b64encode('VT-server-hQ3ySAyvozlOY9GRQssObufG:')}
        response = requests.post(url, json=data, headers=headers)
        return {'success': True, 'redirect': True, 'txn_id': str(txn_id), 'token': response.json()['token']}
    else:
        result = wallet.update_one({'_id': ObjectId(userid)}, {'$inc': {'balance': -walletAmount}})
        result = txn.update_one({'_id': txn_id}, {'$set': {'txnCompleted': True}})
        return {'success': True, 'redirect': False, 'txn_id': str(txn_id)}


@route('/notification', method=['POST'])
@json_to_data
def notification(data):
    order_id = data['order_id']
    trans = txn.find_one({'_id': ObjectId(str(order_id))})
    if data['status_code'] == '200':
        result = wallet.update_one({'_id': ObjectId(trans['userid'])}, {'$inc': {'balance': -trans['walletAmount']}})
        result = txn.update_one({'_id': trans['_id']}, {'$set': {'txnCompleted': True}})
    return ''

@route("/")
def index():
    return template("app/index.html", url=url)


@route("/node_modules", name="node_modules")
def node_modules(filename):
    return static_file(filename, root="node_modules")

@route("/assets/<filename>", name="assets")
def assets(filename):
    return static_file(filename, root="app/assets")

@route("/css/<filename>", name="css")
def css(filename):
    return static_file(filename, root="app/css")

@route("/js/<filename>", name="js")
def js(filename):
    return static_file(filename, root="app/js")

@route("/templates/<filename>", name="templates")
def templates(filename):
    return static_file(filename, root="app/templates")

run(host='localhost', port=8080, reLoader=True, debug=True)
