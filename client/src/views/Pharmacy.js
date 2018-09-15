import React, { Component, Fragment } from 'react';
import { Buffer } from 'buffer';
import moment from 'moment';

class Pharmacy extends Component {
  constructor(props) {
    super(props);
    this.state = { patient: "0x821aea9a577a9b44299b9c15c88cf3087f3b5544", prescriptions: [], filtered_prescriptions: [] };

    this.handleChange = this.handleChange.bind(this);
    this.filterPrescriptionsByDate = this.filterPrescriptionsByDate.bind(this);
    this.filterPrescriptionsByPatient = this.filterPrescriptionsByPatient.bind(this);
  }

  async componentDidMount() {
    const { contract } = this.props;
    const prescriptionEvents = await contract.getPastEvents('WritePrescription', { fromBlock: 0 })
    const prescriptions = prescriptionEvents.map(async prescription => ({
      id: prescription.id,
      patient: prescription.returnValues.patient,
      prescriptionHash: prescription.returnValues.prescriptionHash,
      // prescription is the array of drugs :)
      prescription: JSON.parse((await this.props.node.files.cat(prescription.returnValues.prescriptionHash)).toString('utf-8'))
    }))
    this.setState({ prescriptions: await Promise.all(prescriptions) });
  }

  handleChange(e) {
    this.setState({ patient: e.target.value });
  }

  filterPrescriptionsByDate() {
    const now = moment();
    this.setState(prevState => ({
      filtered_prescriptions: prevState.filtered_prescriptions
        .map(
          prescription => ({
            ...prescription,
            prescription: prescription.prescription.filter(p =>
              moment(p.endDate).isAfter(now)
            )
          })
        )
        .filter(prescription => prescription.prescription.length)
    }));
  }

  filterPrescriptionsByPatient(e) {
    e.preventDefault();
    if (!this.state.patient.length) {
      return;
    }

    const patient_id = this.state.patient;
    this.setState(prevState => ({ filtered_prescriptions: prevState.prescriptions.filter((prescription) => prescription.patient.toLowerCase() === patient_id.toLowerCase()) }), this.filterPrescriptionsByDate);
  }

  render() {
    return(
      <Fragment>
      <div className="box-title">New Prescription Received</div>

      <div className="pale-rect slim-rect">
        <form onSubmit={this.filterPrescriptionsByPatient}>
          <div className="field is-horizontal">

            <div className="field-label">
              <label className="label" htmlFor="eth_addr">
                <h3 className="title is-5">Patient address</h3>
              </label>
            </div>

            <div className="field is-grouped">
              <p className="control is-expanded">
                <input
                  id="eth_addr"
                  type="text"
                  className="input"
                  onChange={this.handleChange}
                  value={this.state.patient}
                />
              </p>
              <p className="control">
                <button type="submit" className="button is-info">Submit</button>
              </p>
            </div>

          </div>
        </form>
      </div>

      <br />
      <div className="box-title">Pending Prescriptions</div>
      <PharmacyPrescription node={this.props.node} contract={this.props.contract} accounts={this.props.accounts} req={this.props.req} filtered_prescriptions={this.state.filtered_prescriptions} />
      </Fragment>
    )
  }

}

class PharmacyPrescription extends Component {
  render() {
    return (
      <Fragment>
      {this.props.filtered_prescriptions.map((prescription, idx) => (
        <div className="box">
        <Fragment key={idx}>

        <div className="message-header">
          <form>
            <div className="field is-horizontal">

              <div className="field-label">
                <label className="label" htmlFor="eth_addr">
                  <h3 className="title is-5">Doctor address</h3>
                </label>
              </div>

              <div className="field is-grouped">
                  <input
                    id="eth_addr"
                    type="text"
                    className="input"
                    value={prescription.patient}
                    disabled
                  />
              </div>

            </div>
          </form>
        </div>

        <div className="dark-rect slim-rect">
          <form>
            <div className="field is-horizontal">

              <div className="field-label">
                <label className="label" htmlFor="eth_addr">
                  <h3 className="title is-5">Doctor address</h3>
                </label>
              </div>

              <div className="field is-grouped">
                  <input
                    id="eth_addr"
                    type="text"
                    className="input"
                    value={prescription.patient}
                    disabled
                  />
              </div>

            </div>
          </form>
        </div>

        {prescription.prescription.map(drug =>
          <Fragment key={drug.drug.value}>
            <div className="columns is-multiline">

            <div className="column is-one-third">
            <article className="message is-warning">
              <div className="message-header">
                <p className="message-title">{drug.drug.label}</p>
              </div>
              <div className="message-body">
                <form>
                  <div className="field">
                    Patient should take
                      <input
                        id="quantity"
                        type="text"
                        className="input is-inline-number"
                        value={drug.quantity}
                        readOnly
                      />
                    each dose
                  </div>
                  <br />
                  <div className="field">
                    Patient takes a dose
                      <input
                        id="recurrence"
                        className="input is-inline-number"
                        type="text"
                        value={drug.recurrence}
                        readOnly
                      />
                    times a day
                  </div>
                  <br />
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label" htmlFor="posology">
                        Posology:
                      </label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <div className="control">
                          <textarea
                            id="posology"
                            className="textarea"
                            value={drug.posology}
                            readOnly
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                  <br />
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label" htmlFor="start-date">
                        Start date:
                      </label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <div className="control">
                          <input
                            type="date"
                            id="start-date"
                            className="input"
                            value={drug.startDate}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  <br />
                  <div className="field is-horizontal">
                    <div className="field-label is-normal">
                      <label className="label" htmlFor="end-date">
                        End date:
                      </label>
                    </div>
                    <div className="field-body">
                      <div className="field">
                        <div className="control">
                          <input
                            type="date"
                            id="end-date"
                            className="input"
                            value={drug.endDate}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </form>
              </div>
            </article>
          </div>

            <div className="column is-one-third">
              <article className="message is-success">
                <div className="message-header">
                  <p className="message-title">Prescribed Medicine Status</p>
                </div>
                <div className="message-body">
                  <PrescriptionStatus
                    node={this.props.node}
                    accounts={this.props.accounts}
                    contract={this.props.contract}
                    drug={drug}
                    prescriptionHash={prescription.prescriptionHash}
                  />
                </div>
              </article>
            </div>

            <div className="column is-one-third">
              <article className="message is-dark">
                <div className="message-header">
                  <p className="message-title">Description Details</p>
                </div>
                <div className="message-body">
                  <PrescriptionInfo req={this.props.req} drug={drug}/>
                </div>
              </article>
            </div>
            </div>
            </Fragment>
          )}

        </Fragment>
        </div>
        ))}
      </Fragment>
    )
  }
}

class PrescriptionStatus extends Component {
  constructor(props) {
    super(props);
    this.state = { followup: 0, quantityBrought: 0, totalUnits: 0 };
    this.updateFollowup = this.updateFollowup.bind(this);
    this.onChangeFollowup = this.onChangeFollowup.bind(this);
    this.submitFollowup = this.submitFollowup.bind(this);
  }

  async updateFollowup() {
    const { contract } = this.props;
    const followupEvents = await contract.getPastEvents('WriteFollowup', { fromBlock: 0 })
    const followups = followupEvents.map(async followup => ({
      id: followup.id,
      followupHash: followup.returnValues.followupHash,
      followup: JSON.parse((await this.props.node.files.cat(followup.returnValues.followupHash)).toString('utf-8'))
    })).filter(async followup => ((await followup).followup.prescriptionHash || '').toLowerCase() === this.props.prescriptionHash.toLowerCase())

    followups.forEach(async fu => {
      const { followup } = await fu;
      if (followup.prescriptionHash && (followup.prescriptionHash.toLowerCase() === this.props.prescriptionHash.toLowerCase())) {
        this.setState(prevState => {
          if (prevState.quantityBrought < followup.followup) {
            return ({ quantityBrought: followup.followup });
          }
        })
      }
    })
  }

  componentDidMount() {
    try {
      const treatmentDays = moment(this.props.drug.endDate).diff(moment(this.props.drug.startDate), 'days');
      const totalUnits = Number(this.props.drug.quantity) * Number(this.props.drug.recurrence) * Number(treatmentDays);
      this.setState({totalUnits});
    } catch (e) {
    }
    this.updateFollowup()
  }

  onChangeFollowup(e) {
    this.setState({ followup: e.target.value });
  }

  async submitFollowup() {
    const { contract, accounts, node } = this.props;
    const followup = { followup: (Number(this.state.followup) + Number(this.state.quantityBrought)), prescriptionHash: this.props.prescriptionHash };
    this.setState({ followup: 0 })
    const followupHash = (await node.files.add(new Buffer(JSON.stringify(followup))))[0].hash;
    await contract.writeFollowup(this.state.patient, followupHash, {from: accounts[0]});
    setInterval(this.updateFollowup, 2000); // Ugly, I know ;(
  }

  render() {
    return (
      <Fragment>
        <div className="box">
          Patient has already brought {this.state.quantityBrought} out of {this.state.totalUnits} units
          <progress className="progress is-info" value={this.state.quantityBrought} max={this.state.totalUnits}/>
        </div>
        <div className="box">
          <div className="field">
            Patient brought
            <input className="input is-inline-number" type="text" value={this.state.followup} onChange={this.onChangeFollowup}/>
            units
          </div>
          <button className="button is-info" onClick={this.submitFollowup}>
            Submit
          </button>
        </div>
      </Fragment>
    )
  }
}

class PrescriptionInfo extends Component {
  constructor(props) {
    super(props);
    this.state = { info: '' };
  }

  async componentDidMount() {
    const info = (await this.props.req('/drugs/' + this.props.drug.drug.value + '/info/patient?type=pure-html')).data;
    this.setState({ info });
  }

  render() {
    return (
      <div className="is-drug-info" dangerouslySetInnerHTML={{__html: this.state.info}}/>
    )
  }
}

export default Pharmacy;
