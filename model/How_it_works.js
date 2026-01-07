import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const howitworksschema = new mongoose.Schema({
    
    serial_no: {
          type: String,
          required: true,
        },
        how_it_works_content: {
          type: String,
          required: true,
        },
        
        createdAt: { type: Date, default: Date.now },
      },
      );
howitworksschema.plugin(paginate);
howitworksschema.plugin(aggregatePaginate);
const HowItWorks = mongoose.model("HowItWorks", howitworksschema);

export default HowItWorks;
