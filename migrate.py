import json, requests, re, sys

CF_ACCOUNT_ID = "b2471e0c307123945bdf1ce1b025563f"
CF_API_TOKEN = "cfut_2txZqzDurNUnWLissHBu48MGvxmFkNms85wqBqSTd36be920"
D1_DB_ID = "f2408d93-a90f-4131-89d0-7266d230bb62"

def execute_sql_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove SQL comments
    content = re.sub(r'--[^\n]*', '', content)
    
    # Split by semicolons
    statements = [s.strip() for s in content.split(';') if s.strip()]
    print(f'File: {filepath} - Found {len(statements)} SQL statements')

    url = f'https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/d1/database/{D1_DB_ID}/query'
    headers = {
        'Authorization': f'Bearer {CF_API_TOKEN}',
        'Content-Type': 'application/json'
    }

    success_count = 0
    fail_count = 0
    
    for i, stmt in enumerate(statements):
        payload = {'sql': stmt}
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=30)
            result = resp.json()
            if result.get('success', False):
                success_count += 1
                print(f'  [{i+1}/{len(statements)}] OK')
            else:
                fail_count += 1
                errors = result.get('errors', [])
                print(f'  [{i+1}/{len(statements)}] FAILED: {errors}')
                print(f'    SQL: {stmt[:120]}...')
        except Exception as e:
            fail_count += 1
            print(f'  [{i+1}/{len(statements)}] ERROR: {e}')
    
    print(f'\nResults: {success_count} succeeded, {fail_count} failed out of {len(statements)} total')
    return fail_count == 0

if __name__ == '__main__':
    print('=== Running Schema Migration ===')
    schema_ok = execute_sql_file('apps/api/src/db/schema.sql')
    
    print('\n=== Running Seed Data ===')
    seed_ok = execute_sql_file('apps/api/src/db/seed.sql')
    
    if schema_ok and seed_ok:
        print('\n✅ All migrations completed successfully!')
    else:
        print('\n⚠️ Some statements failed, check output above.')
        sys.exit(1)
