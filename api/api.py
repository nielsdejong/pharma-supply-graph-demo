from fastapi import FastAPI, HTTPException
from neo4j import GraphDatabase, basic_auth
from typing import List
from pydantic import BaseModel
from fastapi.responses import JSONResponse


class ProductDetails(BaseModel):
    product: str
    quantity: int
    customer: str

class Product(BaseModel):
    name: str

class Order(BaseModel):
    id: str

class OrderDetails(BaseModel):
    id: str
    type: str
    start: str
    end: str
    name: str

# Initialize FastAPI app
app = FastAPI()

# Database connection details
uri = "neo4j+s://0bbf8364.databases.neo4j.io:7687"
user = "reader"
password = "copenhagen"

# Connect to Neo4j
driver = GraphDatabase.driver(uri, auth=basic_auth(user, password))

# Function to fetch all orders from Neo4j
def get_all_orders():
    with driver.session() as session:
        query = """
        MATCH (p:Order)
        RETURN p.id as id
        """
        result = session.run(query)
        return [{"id": record["id"]} for record in result]
    

# Function to fetch all products from Neo4j
def get_all_products():
    with driver.session() as session:
        query = """
        MATCH (p:Product)
        RETURN p.name as name
        """
        result = session.run(query)
        return [{"name": record["name"]} for record in result]
    

def get_product_details(product_name: str):
    with driver.session() as session:
        query = """
        MATCH (p:Product{name:$name})<-[:FOR_PRODUCT]-(o:Order)<-[:ORDERED]-(c:Customer)
        RETURN p.name as product, o.quantity as quantity, c.name as customer
        """
        result = session.run(query, name=product_name)
        return [{"product": record["product"], "quantity": record["quantity"], "customer": record["customer"]} for record in result]


# Function to fetch events related to a specific order
def get_order_events(order_id: str):
    with driver.session() as session:
        query = """
        MATCH p=(o:Order)-[r:HAS_EVENT]->(e:Event)-[:LOCATED_AT]->(loc)
        WHERE o.id = $id
        RETURN o.id as id, e.type as type, e.start as start, e.end as end, loc.name as name
        ORDER BY start
        """
        result = session.run(query, id=order_id)
        return [{"id": record["id"], "type": record["type"], "start": str(record["start"]), "end": str(record["end"]), "name": record["name"]} for record in result]



@app.get("/products/{product_name}", response_model=List[ProductDetails])
def read_orders(product_name: str):
    try:
        details = get_product_details(product_name)
        if not details:
            raise HTTPException(
                status_code=404, detail="No orders found for this product")
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Define endpoint to list all products
@app.get("/products/", response_model=List[Product])
def read_products():
    try:
        products = get_all_products()
        if not products:
            raise HTTPException(status_code=404, detail="No products found")
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Define endpoint to list all orders
@app.get("/orders/", response_model=List[Order])
def read_orders():
    try:
        products = get_all_orders()
        if not products:
            raise HTTPException(status_code=404, detail="No products found")
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Define endpoint to get order events by order ID
@app.get("/orders/{id}", response_model=List[OrderDetails])
def read_order_events(id: str):
    try:
        events = get_order_events(id)
        if not events:
            raise HTTPException(status_code=404, detail="No events found for this order")
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# New root endpoint
@app.get("/", response_class=JSONResponse)
def root():
    routes = [{"path": route.path, "name": route.name} for route in app.routes if route.path not in ["/docs/oauth2-redirect","/openapi.json", "/docs", "/redoc"]]
    return {"API Endpoints": routes}


# Ensure to close the driver when the application stops
@app.on_event("shutdown")
def shutdown_event():
    driver.close()
