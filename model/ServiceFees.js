import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const servicefeesschema = new mongoose.Schema({
    
    min: {
          type: Number,
          required: true,
        },
        max: {
          type: Number,
          required: true,
        },
        
        servicefees: {
            type: Number,
            required: true,
          },
          type:{
            type:String
          },
          amount:{
            type: Number,
          }
      },
      );
servicefeesschema.plugin(paginate);
servicefeesschema.plugin(aggregatePaginate);
const ServiceFees = mongoose.model("ServiceFees", servicefeesschema);

export default ServiceFees;