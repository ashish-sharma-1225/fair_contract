import sys
sys.path.insert(0, r"c:\dev\bitchhhh")

from backend.app.models.contract_analysis import ContractAnalysis

schema = ContractAnalysis.model_json_schema()

with open(r"c:\dev\bitchhhh\backend\docs\contract_analysis.schema.json", "w") as f:
    import json
    json.dump(schema, f, indent=2)

print("Schema written successfully to c:\\dev\\bitchhhh\\backend\\docs\\contract_analysis.schema.json")